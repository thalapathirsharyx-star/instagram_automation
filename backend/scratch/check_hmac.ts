import * as crypto from 'crypto';

// The received signatures from the logs
const sig1 = 'ec183ffec7da114b3a9a39c302fc0b59845df1c2505d0469f879f6380e2035ae';
const body1 = '{"object":"instagram","entry":[{"time":1780397106255,"id":"17841434534061820","messaging":[{"sender":{"id":"2182294425935229"},"recipient":{"id":"17841434534061820"},"timestamp":1780397106244,"message_edit":{"mid":"aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDM0NTM0MDYxODIwOjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI3NjI2MjgxNDcxMjY3MjQwMDozMjg0MjUyOTc0OTUwMTY4ODEyNDgxODg5NDI4NTE3NjgzMgZDZD","num_edit":0}}]}]}';

// Keys to test
const keysToTest = [
  '30926c0031c08a3c920189036cf865dc', // App Secret
  '955338716906984', // App ID
  'IG_CRM_VERIFY_TOKEN', // Verify Token
  'EAANk4CDchegBRid6nblRZA69S0PdTGxjj20c5n0TzaSnJN2gr5VYkaoI5ZCIVKZB67eZBWRPxWKWhNuP6mvGCHBDir3qNZAYuAgEVcSH0C7PlG1Vn7B5Vx6tDPjBZB5ctjhR9OczyrjShz0nlXNHGbbkdxfK06fkZAJLZCvpTHjZAFSe2sMkOH50y3fnoJRjBKM9NINsgaoksGOYsImius1ZAd' // Connected Page Token
];

console.log('Testing keys for body 1...');
for (const key of keysToTest) {
  const hmac = crypto.createHmac('sha256', key).update(body1).digest('hex');
  if (hmac === sig1) {
    console.log(`MATCH FOUND! Key: "${key}"`);
  } else {
    console.log(`No match for Key: "${key.slice(0, 10)}...". Result: "${hmac}"`);
  }
}
