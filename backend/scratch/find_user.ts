import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { user } from '../src/Database/Table/Admin/user';

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
    const target = await user.findOne({
      where: { email: 'thalapathir27@gmail.com' },
      relations: ['user_role', 'company']
    });

    if (!target) {
      console.log('RESULT_USER_NOT_FOUND');
      const allUsers = await user.find({ select: ['id', 'email', 'first_name', 'last_name', 'status', 'is_verified'] });
      console.log('ALL_USERS_IN_DB:', JSON.stringify(allUsers, null, 2));
    } else {
      console.log('RESULT_USER_FOUND:', JSON.stringify({
        id: target.id,
        email: target.email,
        first_name: target.first_name,
        last_name: target.last_name,
        role: target.user_role?.code,
        status: target.status,
        is_verified: target.is_verified,
        has_password: Boolean(target.password),
        password_hash_sample: target.password ? target.password.substring(0, 15) + '...' : null,
        created_on: target.created_on
      }, null, 2));
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await connection.close();
  }
}

run();
