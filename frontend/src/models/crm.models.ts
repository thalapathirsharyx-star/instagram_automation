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
  lead_status: 'New' | 'Hot' | 'Buyer' | 'Lost' | 'Needs_Human' | 'Handoff';
  last_message_time: string;
  created_on: string;
  conversation_summary?: string;
  tags?: string[];
  lead_score?: number;
  last_intent?: string;
  /** True while a human agent owns this conversation and automation is suppressed. */
  human_agent_active?: boolean;
  assigned_agent_id?: string | null;
  handoff_at?: string | null;
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

/** Cursor-based paging envelope returned by the Graph API. */
export interface GraphPaging {
  cursors?: { before?: string; after?: string };
  next?: string;
  previous?: string;
}

/** A page of Graph results. */
export interface GraphPage<T> {
  data: T[];
  paging?: GraphPaging;
}

/** Response of GET /Instagram/Settings. */
export interface InstagramIntegrationSettings {
  isConnected: boolean;
  business_id?: string;
  page_name?: string;
  /** Set when the stored Meta token was revoked or is about to expire. */
  needs_reconnect?: boolean;
  connection_detail?: string | null;
  welcome_message?: string;
  auto_reply_enabled?: boolean;
  human_handoff_alerts?: boolean;
  auto_follow_up_enabled?: boolean;
  auto_follow_up_delay_hours?: number;
  auto_follow_up_message?: string;
  story_mention_enabled?: boolean;
  story_mention_message?: string;
  timezone?: string;
  working_hours_start?: string;
  working_hours_end?: string;
  ooo_message?: string;
}

/** Result of POST /Instagram/Connect. */
export interface InstagramConnectResult {
  business_id?: string;
  page_name?: string;
  warnings?: string[];
  missing_scopes?: string[];
  /** Set when the user administers several eligible Pages and must choose one. */
  requires_page_selection?: boolean;
  choices?: { page_id: string; page_name: string; instagram_business_id: string }[];
}

/** Result of the human-agent claim/release endpoints. */
export interface ConversationHandoffResult {
  lead_id: string;
  human_agent_active: boolean;
  assigned_agent_id?: string | null;
  handoff_at?: string | null;
  /** True when a reply now requires the HUMAN_AGENT tag. */
  outside_standard_window?: boolean;
}
