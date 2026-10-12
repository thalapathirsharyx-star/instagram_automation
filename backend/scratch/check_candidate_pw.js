const bcrypt = require('bcrypt');

const hash = '$2b$10$vCHIJ3TsCfhszubUDjCB5u39J0a/.ny9iiw/Gkz62c6jsk0ShF016';
const candidates = [
  'admin',
  'admin123',
  'Admin@123',
  'Admin123',
  'Admin123!',
  'Password@123',
  'password',
  'password123',
  '123456',
  '12345678',
  '123456789',
  'thalapathi',
  'thalapathi27',
  'Thalapathi@27',
  'Thalapathi27',
  'flazly',
  'flazly123',
  'Flazly@123',
  'Flazly2026',
  'welcome',
  'Welcome@123'
];

async function check() {
  for (const c of candidates) {
    const match = await bcrypt.compare(c, hash);
    if (match) {
      console.log('MATCH_FOUND:', c);
      return;
    }
  }
  console.log('NO_MATCH_IN_CANDIDATE_LIST');
}

check();
