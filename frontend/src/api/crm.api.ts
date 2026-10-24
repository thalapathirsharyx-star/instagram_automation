import api from '../lib/axios';
import type {
  ApiResponse, Lead, Message,
  GraphPage, InstagramMediaItem, InstagramCommentItem,
  InstagramIntegrationSettings, InstagramConnectResult, ConversationHandoffResult
} from '../models/crm.models';

export const getLeads = async (qualified?: boolean): Promise<ApiResponse<Lead[]>> => {
  const url = qualified !== undefined ? `/Instagram/Leads?qualified=${qualified}` : '/Instagram/Leads';
  const response = await api.get<ApiResponse<Lead[]>>(url);
  return response.data;
};

export const getMessages = async (leadId: string): Promise<ApiResponse<Message[]>> => {
  const response = await api.get<ApiResponse<Message[]>>(`/Instagram/Messages/${leadId}`);
  return response.data;
};

export const sendMessage = async (leadId: string, text: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Instagram/SendMessage', { leadId, text });
  return response.data;
};

export const processMessage = async (context: any): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Instagram/Process', context);
  return response.data;
};

export const getBalance = async (): Promise<ApiResponse<number>> => {
  const response = await api.get<ApiResponse<number>>('/Instagram/Balance');
  return response.data;
};

export const connectInstagram = async (token: string, pageId?: string): Promise<ApiResponse<InstagramConnectResult>> => {
  const response = await api.post<ApiResponse<InstagramConnectResult>>('/Instagram/Connect', { token, pageId });
  return response.data;
};

export const disconnectInstagram = async (): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Instagram/Disconnect');
  return response.data;
};

export const getInstagramSettings = async (): Promise<ApiResponse<InstagramIntegrationSettings>> => {
  const response = await api.get<ApiResponse<InstagramIntegrationSettings>>('/Instagram/Settings');
  return response.data;
};

export const updateInstagramSettings = async (data: { appId: string, appSecret: string }): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Instagram/Settings', data);
  return response.data;
};

export const getAIPrompt = async (): Promise<ApiResponse<{ prompt: string }>> => {
  const response = await api.get<ApiResponse<{ prompt: string }>>('/Instagram/Prompt');
  return response.data;
};

export const updateAIPrompt = async (prompt: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Instagram/Prompt', { prompt });
  return response.data;
};

// --- COMMENTS MANAGEMENT (instagram_business_manage_comments) ---

export const getInstagramMedia = async (limit?: number, after?: string): Promise<ApiResponse<GraphPage<InstagramMediaItem>>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (after) params.append('after', after);
  const response = await api.get<ApiResponse<GraphPage<InstagramMediaItem>>>(`/Instagram/Media?${params.toString()}`);
  return response.data;
};

export const getInstagramComments = async (mediaId: string, limit?: number, after?: string): Promise<ApiResponse<GraphPage<InstagramCommentItem>>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (after) params.append('after', after);
  const response = await api.get<ApiResponse<GraphPage<InstagramCommentItem>>>(`/Instagram/Media/${mediaId}/Comments?${params.toString()}`);
  return response.data;
};

export const replyToInstagramComment = async (commentId: string, message: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/Instagram/Comments/${commentId}/Reply`, { message });
  return response.data;
};

export const hideInstagramComment = async (commentId: string, hide: boolean = true): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/Instagram/Comments/${commentId}/Hide`, { hide });
  return response.data;
};

export const deleteInstagramComment = async (commentId: string): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/Instagram/Comments/${commentId}`);
  return response.data;
};

// --- HUMAN AGENT HANDOFF ---

/**
 * A human agent takes over a conversation. The automation engine stops replying until
 * the conversation is released, so the agent is not talked over by the AI.
 */
export const claimConversation = async (leadId: string): Promise<ApiResponse<ConversationHandoffResult>> => {
  const response = await api.post<ApiResponse<ConversationHandoffResult>>(`/Instagram/Leads/${leadId}/Handoff`);
  return response.data;
};

/** Hands the conversation back to the automation engine. */
export const releaseConversation = async (leadId: string): Promise<ApiResponse<ConversationHandoffResult>> => {
  const response = await api.post<ApiResponse<ConversationHandoffResult>>(`/Instagram/Leads/${leadId}/Release`);
  return response.data;
};
