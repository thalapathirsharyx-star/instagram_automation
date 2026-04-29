const { Client } = require('pg');
require('dotenv').config();

async function checkLeads() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/instagram_automation'
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const companyRes = await client.query('SELECT id, name FROM company LIMIT 5');
    console.log('Companies:', companyRes.rows);

    if (companyRes.rows.length > 0) {
      const companyId = companyRes.rows[0].id;
      const leadsRes = await client.query('SELECT id, instagram_handle, is_qualified FROM instagram_lead WHERE company_id = $1', [companyId]);
      console.log(`Leads for company ${companyId}:`, leadsRes.rows.length);
      console.log('Sample Leads:', leadsRes.rows);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkLeads();
