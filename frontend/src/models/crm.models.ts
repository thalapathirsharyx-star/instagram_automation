export interface ApiResponse<T> {
  Type: string;
  Message: string;
  Data: T;
}

export interface Lead {
  id: string;
  customer_name: string;
  instagram_handle: string;
  lead_status: 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human';
  last_message_time: string;
  created_on: string;
}

export interface Message {
  id: string;
  lead_id: string;
  message_text: string;
  direction: 'Inbound' | 'Outbound';
  action_taken?: string;
  ai_notes?: string;
  created_on: string;
}
