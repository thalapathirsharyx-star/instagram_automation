export interface ProductContext {
  id?: string;
  name: string;
  price: number;
  available_stock: number;
  category: string;
  description?: string;
}

export interface AutoReplySettings {
  is_enabled: boolean;
  min_delay_ms: number;
  max_delay_ms: number;
  custom_signature?: string;
  allow_ai_override: boolean;
}

export interface InstagramMessageContext {
  customer_name: string;
  instagram_handle: string;
  message_text: string;
  conversation_history: string[];
  tags: string[];
  lead_status: 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human' | string;
  last_message_time: Date;
  product_context: ProductContext[];
  auto_reply_settings: AutoReplySettings;
}

export interface InstagramActionResponse {
  action: 'AUTO_KEYWORD_REPLY' | 'AI_REPLY' | 'HUMAN_HANDOFF' | 'FOLLOW_UP' | 'TRACKING_UPDATE' | string;
  reply: string;
  status_update: 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human' | string;
  tags?: string[];
  notes: string;
}
