export interface ApiResponse<T> {
  Type?: string;
  Message?: string;
  Success?: boolean;
  Data?: T;
}

export interface Lead {
  id: string;
  customer_name: string;
  instagram_handle: string;
  lead_status: 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human';
  last_message_time: string;
  created_on: string;
  conversation_summary?: string;
  tags?: string[];
  lead_score?: number;
  last_intent?: string;
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

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  comments_count?: number;
  like_count?: number;
}

export interface InstagramCommentItem {
  id: string;
  text: string;
  timestamp: string;
  username?: string;
  like_count?: number;
  hidden?: boolean;
  replies?: {
    data: Array<{
      id: string;
      text: string;
      timestamp: string;
      username?: string;
    }>;
  };
}
