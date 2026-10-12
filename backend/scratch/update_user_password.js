const { Client } = require('pg');
const bcrypt = require('bcrypt');
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

    const newPassword = 'Password@123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateRes = await client.query(
      `UPDATE "user" 
       SET password = $1, is_verified = true, status = true, failed_login_count = 0
       WHERE email = $2
       RETURNING id, email, status, is_verified`,
      [hashedPassword, 'thalapathir27@gmail.com']
    );

    if (updateRes.rows.length === 0) {
      console.log('USER_NOT_FOUND');
    } else {
      console.log('PASSWORD_UPDATED_SUCCESSFULLY:', updateRes.rows[0]);
      
      // Verification test
      const testMatch = await bcrypt.compare(newPassword, hashedPassword);
      console.log('VERIFICATION_TEST (bcrypt.compare):', testMatch ? 'PASSED' : 'FAILED');
    }
  } catch (err) {
    console.error('Error updating password:', err.message);
  } finally {
    await client.end();
  }
}

run();
