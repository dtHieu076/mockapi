import { apiClient } from './apiClient';
import { AccountEntity } from '../types';

export const authApi = {
  register: async (data: Partial<AccountEntity>): Promise<AccountEntity> => {
    return apiClient.post<AccountEntity>('/auth/register', data);
  },
  login: async (data: Partial<AccountEntity>): Promise<AccountEntity> => {
    return apiClient.post<AccountEntity>('/auth/login', data);
  }
};
