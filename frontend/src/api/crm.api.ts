import api from '../lib/axios';
import type { ApiResponse, Lead, Message } from '../models/crm.models';

export const getLeads = async (qualified?: boolean): Promise<ApiResponse<Lead[]>> => {
  const url = qualified !== undefined ? `/Instagram/Leads?qualified=${qualified}` : '/Instagram/Leads';
  const response = await api.get<ApiResponse<Lead[]>>(url);
  return response.data;
};

export const getMessages = async (leadId: string): Promise<ApiResponse<Message[]>> => {
  const response = await api.get<ApiResponse<Message[]>>(`/Instagram/Messages/${leadId}`);
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

export const connectInstagram = async (token: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Instagram/Connect', { token });
  return response.data;
};

export const getInstagramSettings = async (): Promise<ApiResponse<any>> => {
  const response = await api.get<ApiResponse<any>>('/Instagram/Settings');
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
