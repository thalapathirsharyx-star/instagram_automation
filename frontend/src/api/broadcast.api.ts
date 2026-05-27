import api from '../lib/axios';
import type { ApiResponse } from '../models/crm.models';

export const listBroadcasts = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>('/Broadcast/List');
  return response.data;
};

export const getBroadcast = async (id: string): Promise<ApiResponse<any>> => {
  const response = await api.get<ApiResponse<any>>(`/Broadcast/${id}`);
  return response.data;
};

export const createBroadcast = async (data: any): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/Broadcast/Create', data);
  return response.data;
};

export const updateBroadcast = async (id: string, data: any): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/Broadcast/Update/${id}`, data);
  return response.data;
};

export const deleteBroadcast = async (id: string): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/Broadcast/Delete/${id}`);
  return response.data;
};

export const getAudienceCount = async (filters: any): Promise<ApiResponse<number>> => {
  const response = await api.post<ApiResponse<number>>('/Broadcast/AudienceCount', { filters });
  return response.data;
};

export const sendBroadcast = async (id: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/Broadcast/Send/${id}`);
  return response.data;
};
