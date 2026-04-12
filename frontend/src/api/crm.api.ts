import axios from 'axios';
import type { ApiResponse, Lead, Message } from '../models/crm.models';

const API_URL = 'http://localhost:8000/api/v1/Instagram';

export const getLeads = async (): Promise<ApiResponse<Lead[]>> => {
  const response = await axios.get<ApiResponse<Lead[]>>(`${API_URL}/Leads`);
  return response.data;
};

export const getMessages = async (leadId: string): Promise<ApiResponse<Message[]>> => {
  const response = await axios.get<ApiResponse<Message[]>>(`${API_URL}/Messages/${leadId}`);
  return response.data;
};

export const processMessage = async (context: any): Promise<ApiResponse<any>> => {
  const response = await axios.post<ApiResponse<any>>(`${API_URL}/Process`, context);
  return response.data;
};
export const getBalance = async (): Promise<ApiResponse<number>> => {
  const response = await axios.get<ApiResponse<number>>(`${API_URL}/Balance`);
  return response.data;
};
