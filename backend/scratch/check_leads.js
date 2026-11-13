const { Client } = require('pg');
require('dotenv').config();

async function checkLeads() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: (process.env.DB_PASS || 'postgres').trim(),
    database: process.env.DB_NAME || 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'instagram_lead'");
    console.log('COLUMNS:', res.rows.map(r => r.column_name));

    const sample = await client.query('SELECT * FROM instagram_lead LIMIT 1');
    console.log('SAMPLE_LEAD:', sample.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkLeads();

