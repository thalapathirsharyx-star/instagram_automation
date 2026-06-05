import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { system_setting } from '@Database/Table/Admin/system_setting';
import { story_context } from '@Database/Table/CRM/story_context';
import { ProductCatalogService } from './ProductCatalog.service';
import { EncryptionService } from '@Service/Encryption.service';
import axios from 'axios';

@Injectable()
export class AIService {
  constructor(
    private _ProductCatalogService: ProductCatalogService,
    private _EncryptionService: EncryptionService
  ) {}

  private async getDecryptedSetting(key: string): Promise<string> {
    const setting = await system_setting.findOne({ where: { setting_key: key } });
    if (!setting || !setting.setting_value) return '';
    try {
      return this._EncryptionService.Decrypt(setting.setting_value);
    } catch {
      return '';
    }
  }

  /**
   * Generate an AI reply using Groq (Llama 3.3) based on message context,
   * conversation history, knowledge base, and business profile.
   */
  async generateAiReply(messageText: string, lead: instagram_lead, companyId: string): Promise<any> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const context = await this.getRelevantContext(messageText, companyId);
    const catalogContext = await this.getRelevantCatalogContext(messageText, companyId);

    const history = await instagram_message.find({
      where: { lead_id: lead.id, company_id: lead.company_id },
      order: { created_on: 'ASC' }
    });
    const MAX_HISTORY_MESSAGES = parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10);
    const historyText = history.slice(-MAX_HISTORY_MESSAGES).map(m => `${m.direction}: ${m.message_text}`).join('\n');

    const previousIntelligence = `
Previous Summary: ${lead.conversation_summary || 'None'}
Agent Notes: ${lead.notes || 'None'}
`;

    const company = await CompanyTable.findOne({ where: { id: companyId } });

    let storyContextStr = '';
    if (lead.last_story_context_id) {
      try {
        const sc = await story_context.findOne({ where: { id: lead.last_story_context_id } });
        if (sc && sc.structured_data) {
          const sd = sc.structured_data;
          storyContextStr = `
═══════════════════════════════
ACTIVE INSTAGRAM STORY CONTEXT
═══════════════════════════════
The customer is replying to/asking about an Instagram Story promoting:
- Product Name: ${sd.product_name || 'N/A'}
- Price: ${sd.price ? `${sd.price}` : 'Not specified'}
- Available Sizes: ${sd.sizes && sd.sizes.length > 0 ? sd.sizes.join(', ') : 'Not specified'}
- Context: ${sd.customer_context || 'N/A'}

You MUST use the above product details to answer the customer's queries about availability, price, size, or orders.
CRITICAL PERSPECTIVE RULE: Even if the general business profile/type (e.g. clothing brand) does not match the product listed in this ACTIVE INSTAGRAM STORY CONTEXT (e.g. Macbook), you MUST treat the story product as a valid item offered by the business! Never tell the customer that the business does not sell or offer the product shown in the story context. Assume the business sells it.
`;
        }
      } catch (err: any) {
        console.error('[AI SERVICE] Failed to load story context:', err.message);
      }
    }

    const profile = company?.business_profile || {
      type: 'clothing brand',
      goal: 'sales and inquiries',
      lead_definition: 'customer who is interested in products, asking about price, size, availability, or wanting to purchase'
    };
    const rules = company?.lead_rules || {
      keywords: ['price', 'size', 'available', 'buy', 'order', 'cost', 'shipping', 'delivery', 'stock'],
      intent_types: ['purchase', 'enquiry', 'support', 'casual']
    };

    const playbookSteps = company?.playbook_steps || [];
    let playbookRules = '';
    if (playbookSteps.length > 0) {
      playbookRules = `
═══════════════════════════════
CUSTOM AUTOMATION PLAYBOOK
═══════════════════════════════
You MUST follow these strict playbook rules defined by the business:
${playbookSteps.map((step: any, index: number) => `${index + 1}. [${step.type.toUpperCase()}] ${step.title}: ${step.value}`).join('\n')}

CRITICAL PLAYBOOK INSTRUCTION: If the customer's message triggers any of the above playbook rules, you MUST prioritize executing that action in your reply (e.g., providing the requested link).
`;
    }

    let oooRule = '';
    if (company?.working_hours_start && company?.working_hours_end && company?.timezone) {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: company.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const [hour, minute] = formatter.format(new Date()).split(':');
        const currentTimeString = `${hour}:${minute}`;

        // Standard check (start < end)
        let isWorkingHours = false;
        if (company.working_hours_start <= company.working_hours_end) {
          isWorkingHours = currentTimeString >= company.working_hours_start && currentTimeString <= company.working_hours_end;
        } else {
          // Night shift (end < start)
          isWorkingHours = currentTimeString >= company.working_hours_start || currentTimeString <= company.working_hours_end;
        }
        
        if (!isWorkingHours) {
          const fallbackMsg = company.ooo_message || "We're currently closed. I'm the AI assistant, but a human will reply during our working hours.";
          oooRule = `
═══════════════════════════════
OUT OF OFFICE / AWAY MODE (ACTIVE)
═══════════════════════════════
The business is currently CLOSED (outside working hours).
You MUST include this exact message in your reply to manage expectations:
"${fallbackMsg}"
`;
        }
      } catch (err: any) {
        console.error('[OOO ERROR] Failed to parse timezone or working hours:', err.message);
      }
    }

    const defaultPrompt = `
You are Flazly, a highly professional AI assistant for a ${profile.type.toUpperCase()} business.
Business goal: \${profile.goal}
Lead definition: \${profile.lead_definition}

═══════════════════════════════
KNOWLEDGE BASE
═══════════════════════════════
\${context}

═══════════════════════════════
PRODUCT CATALOG
═══════════════════════════════
\${catalogContext}

\${storyContextStr}

═══════════════════════════════
PREVIOUS SUMMARY & NOTES
═══════════════════════════════
\${previousIntelligence}

═══════════════════════════════
RECENT HISTORY
═══════════════════════════════
\${historyText}

═══════════════════════════════
CUSTOMER'S MESSAGE
═══════════════════════════════
"\${messageText}"

\${playbookRules}
\${oooRule}

═══════════════════════════════
STRICT RESPONSE RULES
═══════════════════════════════
1. Maintain a respectful, professional retail voice. No slang.
2. Answer in the same language as the customer.
3. NO HALLUCINATIONS: Do not invent info not present in the Knowledge Base or Product Catalog.
4. If unknown, say: "I will check the details and availability for you right away. A team member will get back to you shortly!"
5. Keep responses brief (1-3 sentences) and natural.

═══════════════════════════════
OUTPUT FORMAT (JSON ONLY)
═══════════════════════════════
{
  "reply": "Your brief, natural response to the customer",
  "lead": "yes/no",
  "intent": "\${rules.intent_types.join('/')}",
  "summary": "Cumulative summary of customer needs",
  "confidence": 0.0 to 1.0,
  "confirmed_order": null
}
`;

    let customPrompt = company?.system_prompt || defaultPrompt;

    if (company?.system_prompt && storyContextStr) {
      customPrompt += `\n\n${storyContextStr}`;
    }

    // Always append strict perspective rule to prevent echoing bugs even if they use a custom prompt
    if (company?.system_prompt) {
      // Ensure the AI actually gets the chat history and user message if the custom prompt forgot to include the placeholders
      if (!customPrompt.includes('${previousIntelligence}')) {
        customPrompt += `\n\n═══════════════════════════════\nPREVIOUS INTELLIGENCE (Context Memory)\n═══════════════════════════════\n\${previousIntelligence}`;
      }
      if (!customPrompt.includes('${historyText}')) {
        customPrompt += `\n\n═══════════════════════════════\nCHAT HISTORY (Recent)\n═══════════════════════════════\n\${historyText}`;
      }
      if (!customPrompt.includes('${messageText}')) {
        customPrompt += `\n\n═══════════════════════════════\nCUSTOMER'S MESSAGE\n═══════════════════════════════\n"\${messageText}"`;
      }

      customPrompt += `\n\n═══════════════════════════════
OUTPUT FORMAT (JSON ONLY)
═══════════════════════════════
CRITICAL RULE: You are an AI assistant. You must respond to the user's message appropriately based on your instructions.
Respond ONLY in valid JSON format matching this structure exactly. Do NOT return anything outside the JSON.

{
  "reply": "Your brief, natural response to the customer",
  "lead": "yes/no",
  "intent": "casual",
  "summary": "CUMULATIVE summary of the entire conversation. Do not forget earlier topics! Include all past context.",
  "confidence": 0.9,
  "confirmed_order": null
}`;
    }

    // Replace placeholders in custom prompt
    const prompt = customPrompt
      .replace(/\${context}/g, context)
      .replace(/\${catalogContext}/g, catalogContext)
      .replace(/\${previousIntelligence}/g, previousIntelligence)
      .replace(/\${historyText}/g, historyText)
      .replace(/\${messageText}/g, messageText)
      .replace(/\${profile.type.toUpperCase\(\)}/g, profile.type ? profile.type.toUpperCase() : 'BUSINESS')
      .replace(/\${profile.goal}/g, profile.goal || '')
      .replace(/\${profile.lead_definition}/g, profile.lead_definition || '')
      .replace(/\${rules.keywords.join\(\', \'\)}/g, rules.keywords ? rules.keywords.join(', ') : '')
      .replace(/\${rules.intent_types.join\(\'\/\'\)}/g, rules.intent_types ? rules.intent_types.join('/') : '');

    try {
      const dbProvider = await this.getDecryptedSetting('ACTIVE_LLM_PROVIDER');
      const dbModel = await this.getDecryptedSetting('ACTIVE_LLM_MODEL');
      const dbGroq = await this.getDecryptedSetting('GROQ_API_KEY');
      const dbOpenAI = await this.getDecryptedSetting('OPENAI_API_KEY');
      const dbGemini = await this.getDecryptedSetting('GEMINI_API_KEY');

      const activeProvider = dbProvider || process.env.ACTIVE_LLM_PROVIDER || 'groq';
      const customModel = dbModel || process.env.ACTIVE_LLM_MODEL;
      
      let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      let apiModel = customModel || 'llama-3.3-70b-versatile';
      let apiKey = dbGroq || process.env.GROQ_API_KEY;

      if (activeProvider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        apiModel = customModel || 'gpt-4o-mini';
        apiKey = dbOpenAI || process.env.OPENAI_API_KEY;
      } else if (activeProvider === 'gemini') {
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        apiModel = customModel || 'gemini-2.5-flash';
        apiKey = dbGemini || process.env.GEMINI_API_KEY;
      }

      // Sanitize model string if user accidentally included provider prefixes (Google's OpenAI wrapper fails if models/ is prepended)
      apiModel = apiModel.replace(/^models\//, '').replace(/^google\//, '');
      // Auto-replace deprecated Gemini models (gemini-2.0-flash was sunset June 1 2026)
      if (apiModel === 'gemini-2.0-flash' || apiModel === 'gemini-2.0-flash-lite') {
        apiModel = 'gemini-2.5-flash';
      }

      if (!apiKey) {
        throw new Error(`API Key for ${activeProvider} is missing in configuration.`);
      }

      // Retry logic with exponential backoff for transient errors (503, 429)
      const MAX_RETRIES = 3;
      let lastError: any = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await axios.post(
            apiUrl,
            {
              model: apiModel,
              messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: messageText }
              ],
              response_format: { type: "json_object" }
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 second timeout
            }
          );

          let rawContent = response.data.choices[0].message.content;
          rawContent = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          
          const aiData = JSON.parse(rawContent);
          const isLead = aiData.lead === 'yes' || aiData.lead === true || aiData.is_qualified === true || aiData.lead_status === 'Hot';

          return {
            reply: aiData.reply || aiData.message || aiData.text || "I'll check on that for you!",
            action: aiData.action || 'reply',
            notes: aiData.notes || aiData.summary || '',
            lead_status: isLead ? 'Hot' : 'New',
            is_qualified: isLead,
            tags: aiData.tags || [],
            intent: aiData.intent || 'enquiry',
            confidence: aiData.confidence || 0,
            lead: isLead ? 'yes' : 'no',
            summary: aiData.summary || aiData.notes || '',
            confirmed_order: aiData.confirmed_order || null
          };
        } catch (retryError: any) {
          lastError = retryError;
          const status = retryError.response?.status;
          
          if ((status === 503 || status === 429) && attempt < MAX_RETRIES) {
            const delay = attempt * 2000; // 2s, 4s backoff
            console.warn(`[AI RETRY] Attempt ${attempt}/${MAX_RETRIES} failed (${status}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Non-retryable error or final attempt — break to fallback
          break;
        }
      }

      // FALLBACK: If primary provider failed, try Groq as backup (if not already using it)
      if (activeProvider !== 'groq' && (dbGroq || process.env.GROQ_API_KEY)) {
        console.warn(`[AI FALLBACK] ${activeProvider} failed after ${MAX_RETRIES} retries. Falling back to Groq...`);
        try {
          const fallbackResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: messageText }
              ],
              response_format: { type: "json_object" }
            },
            {
              headers: {
                'Authorization': `Bearer ${await this.getDecryptedSetting('GROQ_API_KEY') || process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            }
          );

          let rawContent = fallbackResponse.data.choices[0].message.content;
          rawContent = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          
          const aiData = JSON.parse(rawContent);
          const isLead = aiData.lead === 'yes' || aiData.lead === true || aiData.is_qualified === true || aiData.lead_status === 'Hot';

          console.log(`[AI FALLBACK] Groq responded successfully.`);
          return {
            reply: aiData.reply || aiData.message || aiData.text || "I'll check on that for you!",
            action: aiData.action || 'reply',
            notes: aiData.notes || aiData.summary || '',
            lead_status: isLead ? 'Hot' : 'New',
            is_qualified: isLead,
            tags: aiData.tags || [],
            intent: aiData.intent || 'enquiry',
            confidence: aiData.confidence || 0,
            lead: isLead ? 'yes' : 'no',
            summary: aiData.summary || aiData.notes || '',
            confirmed_order: aiData.confirmed_order || null
          };
        } catch (fallbackError: any) {
          console.error(`[AI FALLBACK] Groq also failed:`, fallbackError.response?.data || fallbackError.message);
        }
      }

      // All providers failed
      console.error(`[AI ERROR] All providers failed.`);
      if (lastError?.response) {
        console.error('Last Response Data:', JSON.stringify(lastError.response.data, null, 2));
        console.error('Last Status Code:', lastError.response.status);
      } else if (lastError) {
        console.error('Last Error Message:', lastError.message);
      }
      return { reply: "I'll check on that for you!", action: 'human_required' };
    } catch (error: any) {
      console.error(`[AI ERROR] Request to ${process.env.ACTIVE_LLM_PROVIDER || 'LLM API'} failed.`);
      if (error.response) {
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('Status Code:', error.response.status);
      } else {
        console.error('Error Message:', error.message);
      }
      return { reply: "I'll check on that for you!", action: 'human_required' };
    }
  }

  /**
   * Find relevant products from the product catalog.
   */
  async getRelevantCatalogContext(messageText: string, companyId: string): Promise<string> {
    try {
      const items = await this._ProductCatalogService.queryCatalog(companyId, messageText);
      if (!items || items.length === 0) return "No products matching query in catalog.";

      let combined = '';
      for (const item of items) {
        const entry = `[Product: ${item.name}]
Price: ${item.price}
SKU: ${item.sku || 'N/A'}
Stock Quantity: ${item.stock_quantity}
Variants: ${item.variants || 'None'}
Description: ${item.description || 'N/A'}
\n`;
        if ((combined + entry).length < 4000) {
          combined += entry;
        } else break;
      }
      return combined;
    } catch (err) {
      console.error('[CATALOG CONTEXT ERROR]', err);
      return "No product catalog context available.";
    }
  }

  /**
   * Find relevant knowledge base items for a given user message.
   * Uses keyword-based scoring for context retrieval.
   */
  async getRelevantContext(messageText: string, companyId: string): Promise<string> {
    try {
      const kbRepo = await knowledge_base.find({ where: { company_id: companyId } });
      if (!kbRepo || kbRepo.length === 0) return "No specific data provided.";

      const query = messageText.toLowerCase();

      // Rank knowledge items by relevance
      const scoredItems = kbRepo.map(item => {
        let score = 0;
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();

        // Priority 1: Title match
        if (query.includes(title) || title.includes(query)) score += 20;

        const stopWords = new Set(['i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'of', 'at', 'by', 'for', 'with', 'about', 'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'hello', 'hi', 'hey', 'please', 'thanks', 'thank', 'looking']);
      
      const queryWords = query.split(/[\s,.;:!?]+/).filter(w => w.length >= 3 && !stopWords.has(w));
      for (const word of queryWords) {
        if (content.includes(word)) score += 5;
        if (title.includes(word)) score += 10;
        // Bonus for price-related numbers if query contains them
        if (/\d+/.test(word) && content.includes(word)) score += 15;
      }

      return { item, score };
    });

    const MAX_KB_RESULTS = parseInt(process.env.MAX_KB_RESULTS || '3', 10);
    const relevant = scoredItems
      .filter(si => si.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(si => si.item)
      .slice(0, MAX_KB_RESULTS);

    if (relevant.length > 0) {
      console.log(`[CONTEXT] Found ${relevant.length} relevant KB items for query.`);
        // Combine content but limit to avoid token bloat
        let combined = '';
        for (const item of relevant) {
          const entry = `[Document: ${item.title}]\n${item.content}\n\n`;
          if ((combined + entry).length < 8000) {
            combined += entry;
          } else break;
        }
        return combined;
      }

      // Fallback: Return the most recent items if no direct match found
      console.log(`[CONTEXT] No direct match for "${query}". Returning fallback context.`);
      return kbRepo.slice(0, 5).map(i => `[${i.title}]: ${i.content.slice(0, 1000)}`).join('\n');
    } catch (err) {
      console.error('[CONTEXT ERROR]', err);
      return "General business information.";
    }
  }

  /**
   * Analyze the OCR text extracted from a story to structure it into JSON.
   */
  async analyzeStoryOcrText(ocrText: string): Promise<any> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const prompt = `
You are an expert product data extractor.
Analyze the following raw OCR text extracted from an Instagram Story image and convert it into a clean structured JSON object.

Extract:
1. Product name (e.g. "Nike Air Max", or a brief title of what is promoted)
2. Price (numeric value only, e.g. 5999, or null if not found)
3. Available sizes (array of sizes like ["7", "8", "9"] or ["S", "M", "L"], or empty array if not found)
4. A brief customer context summarizing what the story is promoting.

OCR TEXT:
"""
${ocrText}
"""

Return ONLY valid JSON in this exact format. No extra text or markdown formatting.

{
  "product_name": "Product Name Here",
  "price": 1234 or null,
  "sizes": ["size1", "size2"] or [],
  "customer_context": "Instagram story promotes..."
}
`;

    try {
      const dbProvider = await this.getDecryptedSetting('ACTIVE_LLM_PROVIDER');
      const dbModel = await this.getDecryptedSetting('ACTIVE_LLM_MODEL');
      const dbGroq = await this.getDecryptedSetting('GROQ_API_KEY');
      const dbOpenAI = await this.getDecryptedSetting('OPENAI_API_KEY');
      const dbGemini = await this.getDecryptedSetting('GEMINI_API_KEY');

      const activeProvider = dbProvider || process.env.ACTIVE_LLM_PROVIDER || 'groq';
      const customModel = dbModel || process.env.ACTIVE_LLM_MODEL;

      let apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      let apiModel = customModel || 'llama-3.3-70b-versatile';
      let apiKey = dbGroq || process.env.GROQ_API_KEY;

      if (activeProvider === 'openai') {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        apiModel = customModel || 'gpt-4o-mini';
        apiKey = dbOpenAI || process.env.OPENAI_API_KEY;
      } else if (activeProvider === 'gemini') {
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        apiModel = customModel || 'gemini-2.0-flash';
        apiKey = dbGemini || process.env.GEMINI_API_KEY;
      }

      // Sanitize model string if user accidentally included provider prefixes
      apiModel = apiModel.replace(/^models\//, '').replace(/^google\//, '');

      if (!apiKey) {
        throw new Error(`API Key for ${activeProvider} is missing in configuration.`);
      }

      const response = await axios.post(
        apiUrl,
        {
          model: apiModel,
          messages: [
            { role: 'system', content: prompt }
          ],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (err: any) {
      console.error('[AI OCR ANALYZE ERROR] Failed to analyze OCR text:', err.message);
      return {
        product_name: null,
        price: null,
        sizes: [],
        customer_context: `Failed to analyze OCR text: ${ocrText}`
      };
    }
  }
}
