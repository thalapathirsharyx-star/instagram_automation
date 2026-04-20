import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { company } from '@Database/Table/Admin/company';
import { user } from '@Database/Table/Admin/user';
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

}
