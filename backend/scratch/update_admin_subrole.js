const { Client } = require('pg');
require('dotenv').config();

async function updateAdminSubrole() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '8610',
    database: process.env.DB_NAME || 'instagram'
  });

  try {
    await client.connect();
    console.log('Connected to Database successfully!');

    // Get all user roles to identify Super Admin role
    const rolesRes = await client.query('SELECT id, name, code FROM user_role');
    console.log('Available User Roles:', rolesRes.rows);

    const superAdminRole = rolesRes.rows.find(r => r.code === 'SUPER_ADMIN');
    if (!superAdminRole) {
      console.error('Super Admin role not found in database!');
      return;
    }

    // List all users with Super Admin role
    const usersRes = await client.query('SELECT id, email, super_admin_sub_role FROM "user" WHERE user_role_id = $1', [superAdminRole.id]);
    console.log('Current Super Admin Users:', usersRes.rows);

    // Update all Super Admin users to have 'Owner' sub-role if they don't have one
    const updateRes = await client.query(
      'UPDATE "user" SET super_admin_sub_role = \'Owner\' WHERE user_role_id = $1 AND super_admin_sub_role IS NULL',
      [superAdminRole.id]
    );
    console.log(`Updated ${updateRes.rowCount} Super Admin user(s) to 'Owner' sub-role.`);

    // If there were none updated, check if we need to force update for a specific user
    const usersResAfter = await client.query('SELECT id, email, super_admin_sub_role FROM "user" WHERE user_role_id = $1', [superAdminRole.id]);
    console.log('Super Admin Users after update:', usersResAfter.rows);

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

updateAdminSubrole();
