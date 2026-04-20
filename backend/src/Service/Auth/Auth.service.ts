import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { company } from '@Database/Table/Admin/company';
import { user } from '@Database/Table/Admin/user';
import { RegisterModel } from '@Model/Admin/User.model';
import { user_role } from '@Database/Table/Admin/user_role';
import { country } from '@Database/Table/Admin/country';
import { currency } from '@Database/Table/Admin/currency';
import { EncryptionService } from '../Encryption.service';
import { HashingService } from '../Hashing.service';

@Injectable()
export class AuthService {
  constructor(
    private _JwtService: JwtService,
    private _EncryptionService: EncryptionService,
    private _HashingService: HashingService
  ) { }

  async ValidateUser(username: string, password: string): Promise<any> {
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
    const isPasswordValid = await this._HashingService.Compare(password, UserData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // For backwards compatibility or super admins, if no company is linked directly,
    // we can either leave it undefined or fetch a default.
    let companyData = UserData.company;
    if (!companyData) {
      const companies = await company.find({ relations: ["currency"] });
      companyData = companies[0] || null;
    }

    const payload = {
      email: UserData.email,
      user_id: UserData.id,
      user_role_id: UserData.user_role_id,
      user_role_name: UserData.user_role?.name || 'CLIENT',
      company: companyData,
      company_id: companyData?.id
    };
    const api_token = this._JwtService.sign(payload);
    return { api_token, user: payload };
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
    await newUser.save();

    return this.ValidateUser(data.email, data.password);
  }
}