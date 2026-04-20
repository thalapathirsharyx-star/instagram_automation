import { DataSource } from 'typeorm';
import { user_role } from '../Table/Admin/user_role';
import { user } from '../Table/Admin/user';
import { currency } from '../Table/Admin/currency';
import { country } from '../Table/Admin/country';
import { company } from '../Table/Admin/company';
import { Injectable } from '@nestjs/common';
import { EncryptionService } from '@Service/Encryption.service';
import { HashingService } from '@Service/Hashing.service';

@Injectable()
export class CommonSeederService {
  constructor(
    private readonly _EncryptionService: EncryptionService,
    private readonly _HashingService: HashingService,
    private _DataSource: DataSource
  ) {
  }
  async Run() {
    try {
      await this.UserRoleSeed();
    }
    catch (e) {
      console.log(e);
    }

    try {
      await this.UserSeed();
    }
    catch (e) {
      console.log(e);
    }

    try {
      await this.CurrencySeed();
    }
    catch (e) {
      console.log(e);
    }

    try {
      await this.CountrySeed();
    }
    catch (e) {
      console.log(e);
    }

    try {
      await this.CompanySeed();
    }
    catch (e) {
      console.log(e);
    }

  }


  UserRoleSeed = async () => {
    const existingRole = await user_role.findOne({ where: { name: "Super Admin" } });
    if (!existingRole) {
      await this._DataSource.manager.createQueryBuilder()
        .insert()
        .into(user_role)
        .values([
          { name: 'Super Admin', code: 'SUPER_ADMIN', created_by_id: "0", created_on: new Date() }
        ])
        .execute()
    }
  }

  UserSeed = async () => {
    const existingUser = await user.findOne({ where: { email: 'admin@user.com' } });
    if (!existingUser) {
      const UserRoleData = await user_role.findOne({ where: { name: "Super Admin" } });
      if (UserRoleData) {
        const hashedPassword = await this._HashingService.Hash('Login123!!');
        await this._DataSource.manager.createQueryBuilder()
          .insert()
          .into(user)
          .values([
            {
              user_role_id: UserRoleData.id,
              email: 'admin@user.com',
              password: hashedPassword,
              created_by_id: "0",
              created_on: new Date()
            }
          ])
          .execute()
      }
    }
  }

  CurrencySeed = async () => {
    const existingCurrency = await currency.findOne({ where: { name: "Pound sterling" } });
    if (!existingCurrency) {
      await this._DataSource.manager.createQueryBuilder()
        .insert()
        .into(currency)
        .values([
          {
            name: 'Pound sterling',
            code: 'GBP',
            symbol: '£',
            created_by_id: "0",
            created_on: new Date()
          }
        ])
        .execute()
    }
  }

  CountrySeed = async () => {
    const existingCountry = await country.findOne({ where: { name: "United Kingdom" } });
    if (!existingCountry) {
      const CurrencyData = await currency.findOne({ where: { name: "Pound sterling" } });
      if (CurrencyData) {
        await this._DataSource.manager.createQueryBuilder()
          .insert()
          .into(country)
          .values([
            {
              name: 'United Kingdom',
              code: 'UK',
              currency_id: CurrencyData.id,
              created_by_id: "0",
              created_on: new Date()
            }
          ])
          .execute()
      }
    }
  }

  CompanySeed = async () => {
    const existingCompany = await company.findOne({ where: { name: "Jewel Stock" } });
    if (!existingCompany) {
      const CurrencyData = await currency.findOne({ where: { name: "Pound sterling" } });
      const CountryData = await country.findOne({ where: { name: "United Kingdom" } });
      if (CurrencyData && CountryData) {
        await this._DataSource.manager.createQueryBuilder()
          .insert()
          .into(company)
          .values([
            {
              name: "Jewel Stock",
              address: "Jewel Stock",
              postal_code: "Jewel Stock",
              country_id: CountryData.id,
              currency_id: CurrencyData.id,
              email: "Demo",
              website: "Demo",
              invoice_footer: "jewelstock",
              created_by_id: "0",
              created_on: new Date()
            }
          ])
          .execute()
      }
    }
  }


}

