import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function debug() {
  const token = (process.env.IG_PAGE_ACCESS_TOKEN || '').trim();
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;

  console.log('--- DEBUGGING INSTAGRAM TOKEN ---');
  console.log('App ID:', appId);
  console.log('Token Length:', token.length);

  try {
    // 1. Debug Token
    const debugRes = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: token,
        access_token: `${appId}|${appSecret}`
      }
    });

    console.log('\n--- TOKEN PERMISSIONS ---');
    const data = debugRes.data.data;
    console.log('Scopes:', data.scopes.join(', '));
    console.log('Expires At:', new Date(data.expires_at * 1000).toLocaleString());
    console.log('Is Valid:', data.is_valid);
    
    if (!data.scopes.includes('instagram_manage_messages')) {
      console.log('\n❌ ERROR: "instagram_manage_messages" is MISSING from this token.');
    } else {
      console.log('\n✅ Token has "instagram_manage_messages".');
    }

    // 2. Check Page ID and Platform
    const meRes = await axios.get(`https://graph.facebook.com/v20.0/me`, {
      params: { fields: 'id,name' },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\n--- PAGE INFO ---');
    console.log('Page:', meRes.data.name, `(${meRes.data.id})`);

  } catch (err) {
    console.error('\n❌ DEBUG FAILED:', err.response?.data || err.message);
  }
}

debug();
