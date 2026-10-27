const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: (process.env.DB_PASS || 'postgres').trim(),
    database: process.env.DB_NAME || 'postgres'
  });

  try {
    await client.connect();
    const bcrypt = require('bcrypt');
    const res = await client.query(`
      SELECT u.id, u.email, u.status, u.is_verified, ur.code as role_code, c.name as company_name, u.password
      FROM "user" u
      LEFT JOIN "user_role" ur ON u.user_role_id = ur.id
      LEFT JOIN "company" c ON u.company_id = c.id
    `);
    const candidates = [
      'Login123!!',
      'Password@123',
      'password',
      'admin',
      'admin123',
      'Admin@123',
      'Admin123',
      'Admin123!',
      '123456',
      '12345678',
      '123456789',
      'thalapathi',
      'thalapathi27',
      'Thalapathi@27',
      'Thalapathi27',
      'ram',
      'ram123',
      'Ram@123',
      'flazly',
      'flazly123',
      'Flazly@123',
      '8610'
    ];
    for (const u of res.rows) {
      let match = null;
      if (u.password) {
        for (const c of candidates) {
          if (bcrypt.compareSync(c, u.password)) {
            match = c;
            break;
          }
        }
      }
      console.log({
        email: u.email,
        role: u.role_code,
        status: u.status,
        is_verified: u.is_verified,
        company: u.company_name,
        known_password: match || '(Unknown / custom bcrypt hash)'
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
