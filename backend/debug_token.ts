import axios from 'axios';

async function debugToken() {
  const token = 'EAANk4CDchegBRp1flZCHhyOjaO4wPW07hjDRZAyndvocaDEZBm3hkEievGfGvFqhTYeL7I6GPN6zFwD30IhX3jyHhl0Uv4metx3wOJWxEYoxhi1sbTrgp9w7Qg55hmpVKr7PtYaRhROBBPaFBF0JULNeDF8NSm4FH3rWRRCjFiRTzeYA3IzFxWOeTJgV1Rhz5WO6DX6kXnrNhRoZCx0G';
  
  try {
    const res = await axios.get(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}

debugToken();
