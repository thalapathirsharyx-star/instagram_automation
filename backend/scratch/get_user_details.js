const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'postgres'
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT u.id, u.email, u.status, u.is_verified, ur.code as role_code, c.name as company_name
      FROM "user" u
      LEFT JOIN "user_role" ur ON u.user_role_id = ur.id
      LEFT JOIN "company" c ON u.company_id = c.id
      WHERE u.email = 'thalapathir27@gmail.com'
    `);
    console.log('USER_DETAILS:', res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
