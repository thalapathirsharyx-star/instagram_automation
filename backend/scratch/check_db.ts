import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { user } from '../src/Database/Table/Admin/user';
import { company } from '../src/Database/Table/Admin/company';
import { user_role } from '../src/Database/Table/Admin/user_role';

dotenv.config();

async function run() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    entities: [__dirname + '/../src/Database/Table/**/*.ts'],
    synchronize: false
  });

  try {
    const userCount = await user.count();
    const companyCount = await company.count();
    console.log(`Connection successful. Users: ${userCount}, Companies: ${companyCount}`);

    const allUsers = await user.find({ relations: ['user_role', 'company'] });
    console.log('\n--- USERS IN DATABASE ---');
    for (const u of allUsers) {
      console.log({
        id: u.id,
        email: u.email,
        role: u.user_role?.code || u.user_role_id,
        super_admin_sub_role: u.super_admin_sub_role,
        company: u.company?.name || u.company_id,
        status: u.status
      });
    }

    const allCompanies = await company.find();
    console.log('\n--- COMPANIES IN DATABASE ---');
    for (const c of allCompanies) {
      console.log({
        id: c.id,
        name: c.name,
        email: c.email,
        wallet_balance: c.wallet_balance,
        status: c.status
      });
    }

    const { instagram_lead } = require('../src/Database/Table/CRM/instagram_lead');
    const { instagram_message } = require('../src/Database/Table/CRM/instagram_message');

    console.log('Running GetGlobalStats queries...');
    const [totalLeads, totalMessages, totalClients, totalUsers] = await Promise.all([
      instagram_lead.count(),
      instagram_message.count(),
      company.count(),
      user.count()
    ]);
    const revenue = await company.createQueryBuilder("c")
      .select("SUM(c.wallet_balance)", "total")
      .getRawOne();
    console.log("Stats results:", { 
      totalLeads, 
      totalMessages, 
      totalClients, 
      totalUsers, 
      totalRevenue: parseFloat(revenue?.total || '0') 
    });

    console.log('Running GetAllForAdmin queries...');
    const companies = await company.createQueryBuilder('c')
      .leftJoinAndSelect('c.country', 'country')
      .leftJoinAndSelect('c.currency', 'currency')
      .addSelect('c.created_on')
      .getMany();

    // Add stats per company
    const companiesWithStats = await Promise.all(companies.map(async (c) => {
      const [userCount, leadCount] = await Promise.all([
        user.count({ where: { company_id: c.id } }),
        instagram_lead.count({ where: { company_id: c.id } })
      ]);
      return {
        ...c,
        userCount,
        leadCount
      };
    }));
    console.log("GetAllForAdmin results: Success, loaded", companiesWithStats.length, "companies");

    const { error_log } = require('../src/Database/Table/Admin/error_log');
    const allErrors = await error_log.find({ order: { created_on: 'DESC' }, take: 10 });
    console.log('\n--- RECENT ERROR LOGS ---');
    for (const err of allErrors) {
      console.log({
        url: err.url,
        message: err.message,
        created_on: err.created_on
      });
    }

  } catch (err: any) {
    console.error('Error running script:', err.message);
  } finally {
    await connection.close();
  }
}

run();
