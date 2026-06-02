import { Injectable } from '@nestjs/common';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { story_context } from '@Database/Table/CRM/story_context';
import axios from 'axios';

@Injectable()
export class AIService {

  /**
   * Generate an AI reply using Groq (Llama 3.3) based on message context,
   * conversation history, knowledge base, and business profile.
   */
  async generateAiReply(messageText: string, lead: instagram_lead, companyId: string): Promise<any> {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const context = await this.getRelevantContext(messageText, companyId);

    const history = await instagram_message.find({
      where: { lead_id: lead.id, company_id: lead.company_id },
      order: { created_on: 'ASC' }
    });
    const historyText = history.slice(-25).map(m => `${m.direction}: ${m.message_text}`).join('\n');

    const previousIntelligence = `
Previous Summary: ${lead.conversation_summary || 'None'}
Previous Tags: ${(lead.tags || []).join(', ')}
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
You are Maya, a warm and polite sales assistant and lead classifier for a \${profile.type.toUpperCase()} business.
You genuinely care about helping customers find the right product or service.

Business goal: \${profile.goal}
Lead definition: \${profile.lead_definition}
Keywords: \${rules.keywords.join(', ')}

═══════════════════════════════
KNOWLEDGE BASE (Product Info)
═══════════════════════════════
\${context}

${storyContextStr}

═══════════════════════════════
PREVIOUS INTELLIGENCE (Context Memory)
═══════════════════════════════
\${previousIntelligence}

═══════════════════════════════
CHAT HISTORY (Recent)
═══════════════════════════════
\${historyText}

═══════════════════════════════
CUSTOMER'S MESSAGE
═══════════════════════════════
"\${messageText}"

═══════════════════════════════
LEAD QUALIFICATION RULES
═══════════════════════════════
- Mark "lead": "yes" if the customer shows clear interest in any product mentioned in the KNOWLEDGE BASE.
- If they ask about price, sizing, fabric, material, or availability of an item, they ARE a lead.
- If they express intent to visit the store, book an appointment, or ask "how to order", they ARE a lead.
- If they are just saying "hi", "thanks", "ok", or "cool", they are NOT a lead yet.
- When in doubt if it's a product inquiry, prefer marking "lead": "yes" to ensure follow-up.
- SUMMARY RULE: Your summary must be CUMULATIVE. Don't forget earlier topics. If they asked about shirts 10 mins ago and now pants, the summary must mention BOTH.
${playbookRules}
${oooRule}
═══════════════════════════════
LANGUAGE RULES (CRITICAL)
═══════════════════════════════
- Detect the language of the customer's last message and reply in the SAME language.
- Tamil script (e.g. "என்ன விலை?") → reply politely in Tamil script.
- Tanglish (e.g. "anna price sollunga") → reply warmly in Tanglish, respectful tone.
- English → reply in polite, friendly English.
- Never switch language unless the customer does first.

═══════════════════════════════
OUTPUT FORMAT (JSON ONLY)
═══════════════════════════════
Return ONLY valid JSON. No extra text outside it.

{
  "reply": "smart auto-reply based on intent (enquiry -> info from KB, purchase -> how to buy, casual -> greeting)",
  "action": "reply",
  "lead": "yes/no",
  "intent": "\${rules.intent_types.join('/')}",
  "summary": "2-3 sentence overview of what the customer wants and current status. Mandatory even for greetings.",
  "confidence": 0.0 to 1.0,
  "detected_language": "english" | "tamil" | "tanglish",
  "tags": ["interested", "pricing", "size_query", "support"]
}
`;

    let customPrompt = company?.system_prompt || defaultPrompt;

    if (company?.system_prompt && storyContextStr) {
      customPrompt += `\n\n${storyContextStr}`;
    }

    // Always append strict perspective rule to prevent echoing bugs even if they use a custom prompt
    if (company?.system_prompt) {
      customPrompt += `\n\nCRITICAL RULE: Respond ONLY in valid JSON format.
Include these fields:
- "reply": your response to the customer
- "lead": "yes" or "no"
- "intent": "purchase/enquiry/support/casual"
- "confidence": 0.0 to 1.0
- "summary": a 2-3 sentence summary of the discussion so far
- "tags": array of interest tags`;
    }

    // Replace placeholders in custom prompt
    const prompt = customPrompt
      .replace(/\${context}/g, context)
      .replace(/\${previousIntelligence}/g, previousIntelligence)
      .replace(/\${historyText}/g, historyText)
      .replace(/\${messageText}/g, messageText)
      .replace(/\${profile.type.toUpperCase\(\)}/g, profile.type ? profile.type.toUpperCase() : 'BUSINESS')
      .replace(/\${profile.goal}/g, profile.goal || '')
      .replace(/\${profile.lead_definition}/g, profile.lead_definition || '')
      .replace(/\${rules.keywords.join\(\', \'\)}/g, rules.keywords ? rules.keywords.join(', ') : '')
      .replace(/\${rules.intent_types.join\(\'\/\'\)}/g, rules.intent_types ? rules.intent_types.join('/') : '');

    try {
      const response = await axios.post(
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
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiData = JSON.parse(response.data.choices[0].message.content);
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
        summary: aiData.summary || aiData.notes || ''
      };
    } catch (error: any) {
      console.error('[AI ERROR] Groq failed:', error.response?.data || error.message);
      return { reply: "I'll check on that for you!", action: 'human_required' };
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

        // Priority 2: Keyword matches (supporting non-English characters)
        const queryWords = query.split(/[\s,.;:!?]+/).filter(w => w.length >= 2);
        for (const word of queryWords) {
          if (content.includes(word)) score += 5;
          if (title.includes(word)) score += 10;
          // Bonus for price-related numbers if query contains them
          if (/\d+/.test(word) && content.includes(word)) score += 15;
        }

        return { item, score };
      });

      const relevant = scoredItems
        .filter(si => si.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(si => si.item);

      if (relevant.length > 0) {
        console.log(`[CONTEXT] Found ${relevant.length} relevant items for query: ${query}`);
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
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: prompt }
          ],
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
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
