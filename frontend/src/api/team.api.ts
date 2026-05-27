import api from '../lib/axios';
import type { ApiResponse } from '../models/crm.models';

export const getTeamMembers = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>('/Team/List');
  return response.data;
};

export const addTeamMember = async (data: any): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Team/Add', data);
  return response.data;
};

export const removeTeamMember = async (id: string): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/Team/Remove/${id}`);
  return response.data;
};
