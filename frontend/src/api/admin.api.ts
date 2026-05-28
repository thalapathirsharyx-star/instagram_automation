import api from '../lib/axios';
import type { ApiResponse } from '../models/crm.models';

export interface LLMKeysData {
  openai: string;
  gemini: string;
  groq: string;
}

export const getLLMKeys = async (): Promise<ApiResponse<LLMKeysData>> => {
  const response = await api.get<ApiResponse<LLMKeysData>>('/Admin/LLMKeys');
  return response.data;
};

export const updateLLMKeys = async (data: LLMKeysData): Promise<ApiResponse<any>> => {
  const response = await api.patch<ApiResponse<any>>('/Admin/LLMKeys/Update', data);
  return response.data;
};
