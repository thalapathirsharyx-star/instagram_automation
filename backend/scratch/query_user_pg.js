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
    console.log('Connected to PostgreSQL successfully.');

    // Query for target user
    const res = await client.query(
      'SELECT id, email, first_name, last_name, status, is_verified, password, created_on FROM "user" WHERE email ILIKE $1',
      ['%thalapathir27%']
    );

    if (res.rows.length === 0) {
      console.log('NO_USER_FOUND_FOR_QUERY');
      const allUsers = await client.query(
        'SELECT id, email, first_name, last_name, status, is_verified, created_on FROM "user"'
      );
      console.log('ALL_USERS_IN_DB:', JSON.stringify(allUsers.rows, null, 2));
    } else {
      console.log('MATCHING_USERS:');
      for (const row of res.rows) {
        console.log({
          id: row.id,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          status: row.status,
          is_verified: row.is_verified,
          created_on: row.created_on,
          password_is_bcrypt_hash: row.password ? row.password.startsWith('$2') : false,
          password_raw_hash: row.password
        });
      }
    }
  } catch (err) {
    console.error('Query Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
