const https = require('https');

const token = 'IGAAV6NYVzNy5BZAFlxcWtNX1owSWI0c1dzT01FaDRfekRiLUhmR3NsbEtQVTZAMZAVVkYUdRSUF0aGFESlY0ajJxdXUwYXZAvcXlacEx0ZAGdZAWi1WLWdBaVRUaXYyeUJPdjcxMEZA0X2ptWk9aYlFiR0lVWEFyUExXSkx1am1KdlVNYwZDZD';

https.get(`https://graph.facebook.com/me/permissions?access_token=${token}`, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('--- TOKEN PERMISSION RESULTS ---');
    console.log(data);
    console.log('--- END RESULTS ---');
  });
}).on('error', (err) => {
  console.error('Error checking token:', err.message);
});
