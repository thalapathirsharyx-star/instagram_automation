import { OCRService } from './Service/OCR.service';
import { AIService } from './Service/AI.service';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  }
}

async function runTest() {
  const ocrService = new OCRService();
  const aiService = new AIService(null as any, null as any);

  // Standard Tesseract test image URL containing text
  const testImageUrl = 'https://tesseract.projectnaptha.com/img/eng_bw.png';

  console.log('--- 1. Testing OCR Extraction ---');
  console.log('Downloading and reading:', testImageUrl);
  const text = await ocrService.extractTextFromUrl(testImageUrl);
  console.log('\n--- Extracted Text Result ---');
  console.log(text);

  console.log('\n--- 2. Testing AI Structuring Analysis ---');
  // Mocking some sample product story text to test positive extraction
  const productStoryText = "Nike Air Max\nSpecial Offer: $120\nAvailable Sizes: 8, 9, 10, 11\nDM to purchase now!";
  console.log('Analyzing mock text:\n', productStoryText);
  const analyzed = await aiService.analyzeStoryOcrText(productStoryText);
  console.log('\n--- AI Structured JSON Result ---');
  console.log(JSON.stringify(analyzed, null, 2));
}

runTest().catch(console.error);
