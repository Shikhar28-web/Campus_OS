import Tesseract from 'tesseract.js';
import pdf from 'pdf-parse';
import fs from 'fs';

export class OCRService {
  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      const result = await Tesseract.recognize(imagePath, 'eng', {
        logger: (m) => console.log(m),
      });
      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPDF(pdfPath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF Parse Error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }
}

export const ocrService = new OCRService();
