import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { company } from '@Database/Table/Admin/company';
import { user } from '@Database/Table/Admin/user';
import { RegisterModel } from '@Model/Admin/User.model';
import { user_role } from '@Database/Table/Admin/user_role';
import { country } from '@Database/Table/Admin/country';
import { currency } from '@Database/Table/Admin/currency';
import { email_config } from '@Database/Table/Admin/email_config';
import { EncryptionService } from '../Encryption.service';
import { HashingService } from '../Hashing.service';
import { Redis } from 'ioredis';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as randomstring from 'randomstring';

import { SecurityAlertService } from './SecurityAlert.service';
import { EmailService } from '../Email.service';
import axios from 'axios';
import { GRAPH_VERSION } from '../Instagram.service';

const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

/**
 * Placeholder password the frontend sends when provisioning an account through Google
 * sign-in. It is public (it ships in the client bundle), so it must never be accepted as
 * a credential at the login form — see ValidateUser.
 *
 * Replacing this scheme with an `auth_provider` column is the proper fix; until then this
 * constant keeps the one place that must reject it honest.
 */
const SOCIAL_PROVISIONING_PASSWORD = 'GoogleUser123!!';

@Injectable()
export class AuthService {
  constructor(
    private _JwtService: JwtService,
    private _EncryptionService: EncryptionService,
    private _HashingService: HashingService,
    @Inject("REDIS_CLIENT") private _RedisClient: Redis,
    private _SecurityAlertService: SecurityAlertService,
    private _EmailService: EmailService
  ) { }

  /**
   * Password sign-in.
   *
   * `internalProvisioning` is set only by Register, which completes a social sign-up by
   * minting a session for the account it just created. Interactive callers leave it false
   * so SOCIAL_PROVISIONING_PASSWORD can never be used as a real password: that constant
   * ships in the frontend bundle, and accepting it at the login form would let anyone sign
   * in to any Google-registered account.
   */
  async ValidateUser(username: string, password: string, internalProvisioning = false): Promise<any> {
    if (!internalProvisioning && password === SOCIAL_PROVISIONING_PASSWORD) {
      console.error(`[SECURITY] Blocked login attempt using the social provisioning password for ${username}.`);
      throw new Error('This account uses Google Sign-In. Please continue with Google.');
    }

    const UserData = await user.findOne({
      where: { email: username },
      relations: ['user_role', 'company']
    });

    if (!UserData) {
      throw new Error('Invalid email id');
    }
    if (UserData.status == false) {
      throw new Error('User suspended, contanct administration');
    }
    if (UserData.company && UserData.company.status === false) {
      throw new Error('Your company account has been suspended by the administration.');
    }
    if (UserData.is_verified === false) {
      if (UserData.user_role?.code === 'SUPER_ADMIN') {
        UserData.is_verified = true;
        await UserData.save();
      } else {
        // Auto-verify users created before June 1, 2026 or team members (AGENT)
        const cutoffDate = new Date('2026-06-01T12:00:00Z');
        if ((UserData.created_on && UserData.created_on < cutoffDate) || UserData.user_role?.code === 'AGENT') {
          UserData.is_verified = true;
          await UserData.save();
        } else {
          throw new Error('Please verify your email address before logging in.');
        }
      }
    }
    const isPasswordValid = await this._HashingService.Compare(password, UserData.password);
    if (!isPasswordValid) {
      if (UserData.user_role?.code === 'SUPER_ADMIN') {
        UserData.failed_login_count = (UserData.failed_login_count || 0) + 1;
        if (UserData.failed_login_count >= 5) {
          UserData.status = false;
        }
        await UserData.save();
        if (UserData.failed_login_count >= 5) {
          await this._SecurityAlertService.SendAlert(
            'Admin Account Locked',
            `Super Admin user account has been locked due to 5+ failed login attempts:\n- Email: ${UserData.email}`
          );
          throw new Error('Account locked due to too many failed login attempts.');
        }
      }
      throw new Error('Invalid password');
    }

    if (UserData.user_role?.code === 'SUPER_ADMIN' && UserData.failed_login_count > 0) {
      UserData.failed_login_count = 0;
      await UserData.save();
    }

    // A tenant user only ever gets their own workspace. The default-to-first-company
    // fallback is confined to SUPER_ADMIN, who already has cross-tenant access by role;
    // applying it to a client user would silently hand them another tenant's Instagram
    // connection, leads and conversations.
    let companyData = UserData.company;
    if (!companyData && UserData.user_role?.code === 'SUPER_ADMIN') {
      const companies = await company.find({ relations: ["currency"] });
      companyData = companies[0] || null;
    }

    // If 2FA is enabled, return a temporary pending state!
    if (UserData.two_factor_enabled) {
      const tempPayload = {
        email: UserData.email,
        user_id: UserData.id,
        pending_2fa: true
      };
      const temp_token = this._JwtService.sign(tempPayload, { expiresIn: '5m' });
      return { status: 'pending_2fa', temp_token };
    }

    if (UserData.user_role?.code === 'SUPER_ADMIN' && !UserData.super_admin_sub_role) {
      UserData.super_admin_sub_role = 'Owner';
      await UserData.save();
    }

    const payload = {
      email: UserData.email,
      user_id: UserData.id,
      user_role_id: UserData.user_role_id,
      user_role_code: UserData.user_role?.code || 'CLIENT',
      user_role_name: UserData.user_role?.name || 'Client',
      company: companyData,
      company_id: companyData?.id,
      super_admin_sub_role: UserData.super_admin_sub_role,
      two_factor_enabled: UserData.two_factor_enabled
    };
    const api_token = this._JwtService.sign(payload);
    return { api_token, user: payload };
  }

  /**
   * Signs a user in with Google.
   *
   * Takes the Google OAuth access token, not an email address. The email must be resolved
   * from the token server-side: accepting a caller-supplied email would let anyone obtain
   * a session for any account simply by posting that address.
   */
  async GoogleLogin(accessToken?: string): Promise<any> {
    if (!accessToken) {
      throw new Error('Google sign-in token is required');
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google sign-in is not configured on this server');
    }

    let email: string;
    try {
      // tokeninfo returns the token's audience, so we can confirm it was minted for
      // this application and not for some unrelated Google OAuth client.
      const infoRes = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
        params: { access_token: accessToken }
      });
      const info = infoRes.data || {};

      if (String(info.aud) !== String(GOOGLE_CLIENT_ID)) {
        console.error(`[GOOGLE LOGIN] Rejected token issued for audience ${info.aud}.`);
        throw new Error('Google token was not issued for this application');
      }
      if (!info.email) {
        throw new Error('Google token does not grant access to an email address');
      }
      if (info.email_verified !== true && info.email_verified !== 'true') {
        throw new Error('This Google account does not have a verified email address');
      }
      email = String(info.email).toLowerCase();
    } catch (err: any) {
      if (err.response) {
        console.error('[GOOGLE LOGIN] Token inspection failed:', err.response?.data);
        throw new Error('Google authentication failed. Please sign in again.');
      }
      throw err;
    }

    const UserData = await user.findOne({
      where: { email: email },
      relations: ['user_role', 'company']
    });

    if (!UserData) {
      throw new Error('User not found');
    }
    if (UserData.status == false) {
      throw new Error('User suspended, contanct administration');
    }
    if (UserData.company && UserData.company.status === false) {
      throw new Error('Your company account has been suspended by the administration.');
    }
    
    // Auto-verify if they login with Google
    if (UserData.is_verified === false) {
      UserData.is_verified = true;
      await UserData.save();
    }

    if (UserData.user_role?.code === 'SUPER_ADMIN' && UserData.failed_login_count > 0) {
      UserData.failed_login_count = 0;
      await UserData.save();
    }

    // A tenant user only ever gets their own workspace. The default-to-first-company
    // fallback is confined to SUPER_ADMIN, who already has cross-tenant access by role;
    // applying it to a client user would silently hand them another tenant's Instagram
    // connection, leads and conversations.
    let companyData = UserData.company;
    if (!companyData && UserData.user_role?.code === 'SUPER_ADMIN') {
      const companies = await company.find({ relations: ["currency"] });
      companyData = companies[0] || null;
    }

    if (UserData.two_factor_enabled) {
      const tempPayload = {
        email: UserData.email,
        user_id: UserData.id,
        pending_2fa: true
      };
      const temp_token = this._JwtService.sign(tempPayload, { expiresIn: '5m' });
      return { status: 'pending_2fa', temp_token };
    }

    if (UserData.user_role?.code === 'SUPER_ADMIN' && !UserData.super_admin_sub_role) {
      UserData.super_admin_sub_role = 'Owner';
      await UserData.save();
    }

    const payload = {
      email: UserData.email,
      user_id: UserData.id,
      user_role_id: UserData.user_role_id,
      user_role_code: UserData.user_role?.code || 'CLIENT',
      user_role_name: UserData.user_role?.name || 'Client',
      company: companyData,
      company_id: companyData?.id,
      super_admin_sub_role: UserData.super_admin_sub_role,
      two_factor_enabled: UserData.two_factor_enabled
    };
    const api_token = this._JwtService.sign(payload);
    return { api_token, user: payload };
  }

  async FacebookLogin(accessToken: string): Promise<any> {
    if (!accessToken) {
      throw new Error('Access token is required');
    }

    const APP_ID = process.env.FB_APP_ID;
    const APP_SECRET = process.env.FB_APP_SECRET;
    if (!APP_ID || !APP_SECRET) {
      throw new Error('Facebook login is not configured on this server');
    }

    // 1. Verify the token was issued for THIS app before trusting anything it says.
    //    Calling /me alone is not authentication: a token minted for any other Facebook
    //    app would also return a valid profile, letting an attacker sign in as that user.
    //    debug_token binds the token to our app id.
    try {
      const debugRes = await axios.get(`${GRAPH_BASE}/debug_token`, {
        params: { input_token: accessToken, access_token: `${APP_ID}|${APP_SECRET}` }
      });
      const info = debugRes.data?.data;
      if (!info?.is_valid) {
        throw new Error('Facebook token is not valid');
      }
      if (String(info.app_id) !== String(APP_ID)) {
        console.error(`[FB LOGIN] Rejected token issued for app ${info.app_id}, expected ${APP_ID}.`);
        throw new Error('Facebook token was not issued for this application');
      }
    } catch (err: any) {
      if (err.response) {
        console.error('[FB LOGIN ERROR] Token inspection failed:', err.response?.data?.error?.message);
        throw new Error('Meta authentication failed. Please try connecting again.');
      }
      throw err;
    }

    let fbUser: any;
    try {
      const fbRes = await axios.get(`${GRAPH_BASE}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken
        }
      });
      fbUser = fbRes.data;
    } catch (err: any) {
      console.error('[FB LOGIN ERROR] Failed to fetch user from Meta Graph API:', err.response?.data || err.message);
      throw new Error('Meta authentication failed. Please check your Facebook permissions.');
    }

    if (!fbUser || !fbUser.id) {
      throw new Error('Invalid response from Meta Graph API');
    }

    const fullName = fbUser.name || 'Facebook User';
    // Key the account on the app-scoped Meta id, never on the Facebook-supplied email.
    // Matching an existing password account by email would let anyone who controls a
    // Facebook account bearing that address take it over.
    const linkedEmail = `fb-${fbUser.id}@meta-login.flazly.local`;

    let UserData = await user.findOne({
      where: { email: linkedEmail },
      relations: ['user_role', 'company']
    });

    // Legacy rows created before identities were keyed on the Meta id.
    if (!UserData) {
      UserData = await user.findOne({
        where: { email: `${fbUser.id}@facebook.flazly.com` },
        relations: ['user_role', 'company']
      });
    }

    const email = UserData?.email || linkedEmail;

    if (!UserData) {
      // Auto-register user with default company
      let clientRole = await user_role.findOne({ where: { code: 'CLIENT_ADMIN' } });
      if (!clientRole) {
        clientRole = new user_role();
        clientRole.name = 'Client Admin';
        clientRole.code = 'CLIENT_ADMIN';
        clientRole.created_by_id = '0';
        clientRole.created_on = new Date();
        await clientRole.save();
      }

      const defaultCountry = await country.findOne({ where: {} });
      const defaultCurrency = await currency.findOne({ where: {} });

      const newCompany = new company();
      newCompany.name = `${fullName}'s Workspace`;
      newCompany.address = 'Meta Integrated';
      newCompany.email = email;
      newCompany.postal_code = '000000';
      newCompany.country_id = defaultCountry?.id;
      newCompany.currency_id = defaultCurrency?.id;
      newCompany.created_by_id = '0';
      newCompany.created_on = new Date();
      await newCompany.save();

      const newUser = new user();
      newUser.first_name = fullName;
      newUser.email = email;
      // Random, never-disclosed password. A shared constant here would let anyone who
      // knows it sign in to every Facebook-created account through the password form.
      newUser.password = await this._HashingService.Hash(randomstring.generate(48));
      newUser.user_role_id = clientRole.id;
      newUser.company_id = newCompany.id;
      newUser.created_by_id = '0';
      newUser.created_on = new Date();
      newUser.is_verified = true;
      newUser.status = true;
      await newUser.save();

      UserData = await user.findOne({
        where: { id: newUser.id },
        relations: ['user_role', 'company']
      });
    }

    if (!UserData) {
      throw new Error('Failed to initialize user session');
    }

    if (UserData.status === false) {
      throw new Error('User suspended, contact administration');
    }

    // Auto-verify Facebook authenticated accounts
    if (UserData.is_verified === false) {
      UserData.is_verified = true;
      await UserData.save();
    }

    // Only ever the user's own workspace. Falling back to "the first company in the
    // table" would hand this user another tenant's Instagram account and CRM data.
    const companyData = UserData.company || null;

    const payload = {
      email: UserData.email,
      user_id: UserData.id,
      user_role_id: UserData.user_role_id,
      user_role_code: UserData.user_role?.code || 'CLIENT_ADMIN',
      user_role_name: UserData.user_role?.name || 'Client Admin',
      company: companyData,
      company_id: companyData?.id,
      super_admin_sub_role: UserData.super_admin_sub_role,
      two_factor_enabled: UserData.two_factor_enabled
    };

    const api_token = this._JwtService.sign(payload);
    return { api_token, user: payload };
  }

  async Setup2FA(userId: string) {
    const u = await user.findOne({ where: { id: userId } });
    if (!u) {
      throw new Error('User not found');
    }
    const secret = speakeasy.generateSecret({ length: 20, name: `Flazly:${u.email}` });
    await this._RedisClient.set(`2fa_temp:${userId}`, secret.base32, 'EX', 600);
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    const recoveryCodes = Array.from({ length: 8 }, () => randomstring.generate({ length: 10, charset: 'alphanumeric' }).toUpperCase());
    await this._RedisClient.set(`2fa_temp_codes:${userId}`, JSON.stringify(recoveryCodes), 'EX', 600);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      recoveryCodes
    };
  }

  async Verify2FA(userId: string, token: string) {
    const tempSecret = await this._RedisClient.get(`2fa_temp:${userId}`);
    if (!tempSecret) {
      throw new Error('2FA setup session expired or not initialized. Please try again.');
    }

    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      throw new Error('Invalid verification code.');
    }

    const tempCodesStr = await this._RedisClient.get(`2fa_temp_codes:${userId}`);
    if (!tempCodesStr) {
      throw new Error('Recovery codes expired. Please restart the 2FA setup process.');
    }
    const recoveryCodes: string[] = JSON.parse(tempCodesStr);
    const encryptedSecret = this._EncryptionService.Encrypt(tempSecret);
    const hashedCodes = await Promise.all(recoveryCodes.map(code => this._HashingService.Hash(code)));

    const u = await user.findOne({ where: { id: userId } });
    if (!u) {
      throw new Error('User not found');
    }
    u.two_factor_secret = encryptedSecret;
    u.two_factor_recovery_codes = hashedCodes;
    u.two_factor_enabled = true;
    u.two_factor_enforced_at = new Date();
    await u.save();

    await this._RedisClient.del(`2fa_temp:${userId}`);
    await this._RedisClient.del(`2fa_temp_codes:${userId}`);

    return { success: true };
  }

  async Confirm2FA(tempToken: string, totpCode: string, ipAddress: string) {
    let payload: any;
    try {
      payload = this._JwtService.verify(tempToken);
    } catch (e) {
      throw new Error('Verification session expired or invalid. Please login again.');
    }

    if (!payload || !payload.pending_2fa) {
      throw new Error('Invalid verification context.');
    }

    const UserData = await user.findOne({
      where: { id: payload.user_id },
      relations: ['user_role', 'company']
    });

    if (!UserData) {
      throw new Error('User not found');
    }
    if (UserData.status == false) {
      throw new Error('User suspended, contact administration');
    }

    const decryptedSecret = this._EncryptionService.Decrypt(UserData.two_factor_secret);
    let codeIsValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1
    });

    let usedRecoveryCode = false;
    if (!codeIsValid && UserData.two_factor_recovery_codes) {
      for (let i = 0; i < UserData.two_factor_recovery_codes.length; i++) {
        const isMatch = await this._HashingService.Compare(totpCode.toUpperCase(), UserData.two_factor_recovery_codes[i]);
        if (isMatch) {
          codeIsValid = true;
          usedRecoveryCode = true;
          UserData.two_factor_recovery_codes.splice(i, 1);
          break;
        }
      }
    }

    if (!codeIsValid) {
      UserData.failed_login_count = (UserData.failed_login_count || 0) + 1;
      if (UserData.failed_login_count >= 5) {
        UserData.status = false;
      }
      await UserData.save();
      if (UserData.failed_login_count >= 5) {
        await this._SecurityAlertService.SendAlert(
          'Admin Account Locked (2FA)',
          `Super Admin user account has been locked due to 5+ failed 2FA verification attempts:\n- Email: ${UserData.email}`
        );
        throw new Error('Account locked due to too many failed 2FA verification attempts.');
      }
      throw new Error('Invalid verification code.');
    }

    if (UserData.user_role?.code === 'SUPER_ADMIN' && UserData.last_login_ip && UserData.last_login_ip !== ipAddress) {
      await this._SecurityAlertService.SendAlert(
        'Admin Login from New IP Detected',
        `Super Admin user ${UserData.email} (sub-role: ${UserData.super_admin_sub_role}) logged in from a new/different IP address:\n- Previous IP: ${UserData.last_login_ip}\n- New IP: ${ipAddress}`
      );
    }

    UserData.failed_login_count = 0;
    UserData.last_login_ip = ipAddress;
    await UserData.save();

    // A tenant user only ever gets their own workspace. The default-to-first-company
    // fallback is confined to SUPER_ADMIN, who already has cross-tenant access by role;
    // applying it to a client user would silently hand them another tenant's Instagram
    // connection, leads and conversations.
    let companyData = UserData.company;
    if (!companyData && UserData.user_role?.code === 'SUPER_ADMIN') {
      const companies = await company.find({ relations: ["currency"] });
      companyData = companies[0] || null;
    }

    if (UserData.user_role?.code === 'SUPER_ADMIN' && !UserData.super_admin_sub_role) {
      UserData.super_admin_sub_role = 'Owner';
      await UserData.save();
    }

    const fullPayload = {
      email: UserData.email,
      user_id: UserData.id,
      user_role_id: UserData.user_role_id,
      user_role_code: UserData.user_role?.code || 'CLIENT',
      user_role_name: UserData.user_role?.name || 'Client',
      company: companyData,
      company_id: companyData?.id,
      super_admin_sub_role: UserData.super_admin_sub_role,
      two_factor_enabled: UserData.two_factor_enabled
    };

    const api_token = this._JwtService.sign(fullPayload);
    return { api_token, user: fullPayload };
  }

  async Disable2FA(userId: string) {
    const u = await user.findOne({ where: { id: userId }, relations: ['user_role'] });
    if (!u) {
      throw new Error('User not found');
    }
    u.two_factor_enabled = false;
    u.two_factor_secret = null;
    u.two_factor_recovery_codes = null;
    await u.save();

    if (u.user_role?.code === 'SUPER_ADMIN') {
      await this._SecurityAlertService.SendAlert(
        '2FA Disabled for Admin',
        `Two-Factor Authentication was disabled for Super Admin user:\n- Email: ${u.email}`
      );
    }

    return { success: true };
  }

  async Register(data: RegisterModel): Promise<any> {
    // 1. Check if user exists
    const existingUser = await user.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // 2. Find or create Client Admin role
    let clientRole = await user_role.findOne({ where: { code: 'CLIENT_ADMIN' } });
    if (!clientRole) {
      clientRole = new user_role();
      clientRole.name = 'Client Admin';
      clientRole.code = 'CLIENT_ADMIN';
      clientRole.created_by_id = '0';
      clientRole.created_on = new Date();
      await clientRole.save();
    }

    // 3. Get defaults for Country/Currency
    const defaultCountry = await country.findOne({ where: {} });
    const defaultCurrency = await currency.findOne({ where: {} });

    // 4. Create Company
    const newCompany = new company();
    newCompany.name = data.company_name;
    newCompany.address = 'Default Address';
    newCompany.email = data.email;
    newCompany.postal_code = '000000';
    newCompany.country_id = defaultCountry?.id;
    newCompany.currency_id = defaultCurrency?.id;
    newCompany.created_by_id = '0';
    newCompany.created_on = new Date();
    await newCompany.save();

    // 5. Create User
    const newUser = new user();
    newUser.first_name = data.first_name;
    newUser.email = data.email;
    newUser.password = await this._HashingService.Hash(data.password);
    newUser.user_role_id = clientRole.id;
    newUser.company_id = newCompany.id;
    newUser.created_by_id = '0';
    newUser.created_on = new Date();
    newUser.is_verified = (data.password === 'GoogleUser123!!');
    await newUser.save();

    if (!newUser.is_verified) {
      // Sign a JWT token that expires in 24 hours
      const verifyToken = this._JwtService.sign({ email: newUser.email, user_id: newUser.id }, { expiresIn: '24h' });
      const baseUrl = process.env.DOMAIN_NAME ? process.env.DOMAIN_NAME.replace('8000', '5173').replace('8001', '5173') : 'http://localhost:5173/';
      const verifyUrl = `${baseUrl}verify-email?token=${verifyToken}`;

      // Print verification URL to console for easy development testing
      console.log('\n--------------------------------------------');
      console.log('✉️ NEW REGISTRATION VERIFICATION LINK:');
      console.log(`Email: ${newUser.email}`);
      console.log(`URL:   ${verifyUrl}`);
      console.log('--------------------------------------------\n');

      this._EmailService.SendVerificationEmail(
        newUser.email,
        newUser.first_name || 'User',
        verifyUrl
      ).catch(err => {
        console.error('Failed to send verification email via SMTP:', err);
      });

      return { status: 'pending_verification', message: 'Registration successful! Please check your email to verify your account.' };
    }

    return this.ValidateUser(data.email, data.password, true);
  }

  async Impersonate(adminUserId: string, companyId: string) {
    const adminUser = await user.findOne({
      where: { id: adminUserId },
      relations: ['user_role']
    });

    if (!adminUser || adminUser.user_role?.code !== 'SUPER_ADMIN') {
      throw new Error('Only Super Admin users can trigger client impersonation.');
    }

    const targetCompany = await company.findOne({
      where: { id: companyId },
      relations: ['currency']
    });

    if (!targetCompany) {
      throw new Error('Target company not found.');
    }

    let clientRole = await user_role.findOne({ where: { code: 'CLIENT_ADMIN' } });
    if (!clientRole) {
      clientRole = new user_role();
      clientRole.name = 'Client Admin';
      clientRole.code = 'CLIENT_ADMIN';
      clientRole.created_by_id = '0';
      clientRole.created_on = new Date();
      await clientRole.save();
    }

    const payload = {
      email: adminUser.email,
      user_id: adminUser.id,
      user_role_id: clientRole.id,
      user_role_code: 'CLIENT_ADMIN',
      user_role_name: 'Client Admin',
      company: targetCompany,
      company_id: targetCompany.id,
      impersonator_id: adminUser.id,
      impersonation: true,
      super_admin_sub_role: adminUser.super_admin_sub_role
    };

    const api_token = this._JwtService.sign(payload, { expiresIn: '60m' });

    await this._SecurityAlertService.SendAlert(
      'Client Impersonation Started',
      `Super Admin ${adminUser.email} (sub-role: ${adminUser.super_admin_sub_role}) has started an impersonation session for company: ${targetCompany.name} (ID: ${targetCompany.id}).`
    );

    return { api_token, user: payload };
  }

  async VerifyEmailToken(token: string) {
    let payload: any;
    try {
      payload = this._JwtService.verify(token);
    } catch (e) {
      throw new Error('Verification link has expired or is invalid.');
    }

    const UserData = await user.findOne({ where: { id: payload.user_id } });
    if (!UserData) {
      throw new Error('User not found.');
    }

    if (UserData.is_verified) {
      return { success: true, message: 'Email is already verified.' };
    }

    UserData.is_verified = true;
    await UserData.save();

    return { success: true };
  }

  async ResendVerificationEmail(email: string) {
    const UserData = await user.findOne({ where: { email } });
    if (!UserData) {
      throw new Error('User with this email does not exist.');
    }

    if (UserData.is_verified) {
      throw new Error('Email address is already verified.');
    }

    const verifyToken = this._JwtService.sign({ email: UserData.email, user_id: UserData.id }, { expiresIn: '24h' });
    const baseUrl = process.env.DOMAIN_NAME ? process.env.DOMAIN_NAME.replace('8000', '5173').replace('8001', '5173') : 'http://localhost:5173/';
    const verifyUrl = `${baseUrl}verify-email?token=${verifyToken}`;

    // Print verification URL to console for easy development testing
    console.log('\n--------------------------------------------');
    console.log('✉️ RESENT VERIFICATION LINK:');
    console.log(`Email: ${UserData.email}`);
    console.log(`URL:   ${verifyUrl}`);
    console.log('--------------------------------------------\n');

    this._EmailService.SendVerificationEmail(
      UserData.email,
      UserData.first_name || 'User',
      verifyUrl
    ).catch(err => {
      console.error('Failed to resend verification email via SMTP:', err);
    });

    return { success: true };
  }
}