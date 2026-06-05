import { Injectable } from '@nestjs/common';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';

@Injectable()
export class KnowledgeBaseService {

  async getKnowledgeBase(companyId: string) {
    return await knowledge_base.find({ where: { company_id: companyId }, order: { created_on: 'DESC' } });
  }

  async createKnowledgeItem(companyId: string, data: any) {
    const item = new knowledge_base();
    item.company_id = companyId;
    item.title = data.title;
    item.content = data.content;
    item.category = data.category || 'General';
    item.created_by_id = '00000000-0000-0000-0000-000000000000';
    item.created_on = new Date();
    await item.save();
    return { Success: true, Data: item };
  }

  async deleteKnowledgeItem(companyId: string, id: string) {
    const item = await knowledge_base.findOne({ where: { id, company_id: companyId } });
    if (!item) throw new Error('Knowledge item not found');
    await item.remove();
    return { Success: true };
  }

  async updateKnowledgeItem(companyId: string, id: string, data: any) {
    const item = await knowledge_base.findOne({ where: { id, company_id: companyId } });
    if (!item) throw new Error('Knowledge item not found');
    if (data.title) item.title = data.title;
    if (data.content) item.content = data.content;
    if (data.category) item.category = data.category;
    item.updated_on = new Date();
    await item.save();
    return { Success: true, Data: item };
  }

  async uploadKnowledgeFile(companyId: string, file: any) {
    let content = '';
    const fileName = file.originalname;

    if (fileName.endsWith('.pdf')) {
      const pdfModule = require('pdf-parse');

      try {
        // Support for modern pdf-parse (v2.x) class-based API
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({
            data: file.buffer,
            verbosity: 0
          });
          await parser.load();
          const result = await parser.getText();
          content = result.text;
        }
        // Support for classic pdf-parse (v1.x) function-based API
        else {
          const parseFunction = typeof pdfModule === 'function' ? pdfModule : pdfModule.default;
          if (typeof parseFunction === 'function') {
            const data = await parseFunction(file.buffer);
            content = data.text;
          } else {
            throw new Error('PDF parsing library structure is unrecognized.');
          }
        }
      } catch (e: any) {
        console.error('[PDF PARSE ERROR]', e.message);
        throw new Error(`Failed to parse PDF: ${e.message}`);
      }
    } else if (fileName.endsWith('.txt')) {
      content = file.buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file format. Please upload PDF or TXT.');
    }

    if (!content.trim()) throw new Error('File is empty.');

    const item = new knowledge_base();
    item.company_id = companyId;
    item.title = fileName;
    item.content = content.trim();
    item.category = 'Document';
    item.created_by_id = '00000000-0000-0000-0000-000000000000';
    item.created_on = new Date();
    await item.save();

    return { Success: true, Data: item };
  }
}
