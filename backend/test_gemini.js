const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

async function testGemini() {
    dotenv.config({ path: path.join(__dirname, '.env') });
    const API_KEY = process.env.GEMINI_API_KEY;
    // Try gemini-1.5-flash with v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const payload = {
        contents: [{ parts: [{ text: "Hello" }] }]
    };

    try {
        const response = await axios.post(url, payload);
        console.log('--- SUCCESS ---');
        console.log(response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.log('--- FAILURE ---');
        console.log(error.response?.data || error.message);
    }
}

testGemini();
