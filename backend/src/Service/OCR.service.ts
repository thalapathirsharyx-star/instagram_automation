import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

@Injectable()
export class OCRService {
  async extractTextFromUrl(imageUrl: string): Promise<string> {
    try {
      console.log(`[OCR] Fetching image from URL: ${imageUrl}`);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      console.log(`[OCR] Starting Tesseract text extraction...`);
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      
      console.log(`[OCR] Extracted text: "${text.replace(/\n/g, ' ')}"`);
      return text;
    } catch (err: any) {
      console.error('[OCR ERROR] Failed to perform OCR on image:', err.message);
      return '';
    }
  }
}
