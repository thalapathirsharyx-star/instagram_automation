import api from '../lib/axios';
import type { ApiResponse, Lead, Message } from '../models/crm.models';

export const getLeads = async (): Promise<ApiResponse<Lead[]>> => {
  const response = await api.get<ApiResponse<Lead[]>>('/Instagram/Leads');
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
