import * as crypto from 'crypto';

const key = '30926c0031c08a3c920189036cf865dc';
const data = '{"object":"instagram","entry":[{"time":1780396616761,"id":"17841434534061820","messaging":[{"sender":{"id":"2182294425935229"},"recipient":{"id":"17841434534061820"},"timestamp":1780396616736,"message_edit":{"mid":"aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDM0NTM0MDYxODIwOjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI3NjI2MjgxNDcxMjY3MjQwMDozMjg0MjUyMDcyNDUxODA1NjU0OTU3MjAzMTUzOTA1MjU0NAZDZD","num_edit":0}}]}]}';

console.log('Data length:', data.length);
const hmac = crypto.createHmac('sha256', key).update(data).digest('hex');
console.log('Computed HMAC:', hmac);
