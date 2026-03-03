import { apiClient } from './apiClient';
import { Environment, CreateEnvironmentData } from '../types';
import { MOCK_ENVIRONMENTS } from '../mockData';

const CALL_API = true;

export const environmentApi = {
  getAll: async (accountId: string): Promise<Environment[]> => {
    if (CALL_API) {
      return apiClient.get<Environment[]>(`/subdomains/${accountId}`);
    }
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_ENVIRONMENTS];
  },
  getById: async (accountId: string, id: string): Promise<Environment | undefined> => {
    if (CALL_API) {
      const all = await apiClient.get<Environment[]>(`/subdomains/${accountId}`);
      return all.find(e => e.id === id);
    }
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOCK_ENVIRONMENTS.find(e => e.id === id);
  },
  create: async (accountId: string, data: CreateEnvironmentData): Promise<Environment> => {
    if (CALL_API) {
      return apiClient.post<Environment>(`/subdomains/${accountId}`, data);
    }
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));
    const newEnv: Environment = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      fullDomain: `${data.name}.mockapi.dev`,
      status: 'active',
      description: 'Mock environment',
      apiCount: 0,
      lastModified: 'Just now',
    };
    MOCK_ENVIRONMENTS.unshift(newEnv);
    return { ...newEnv };
  },
  update: async (id: string, data: CreateEnvironmentData): Promise<Environment> => {
    if (CALL_API) {
      return apiClient.put<Environment>(`/subdomains/${id}`, data);
    }
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_ENVIRONMENTS.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Environment not found');
    
    const updatedEnv: Environment = {
      ...MOCK_ENVIRONMENTS[index],
      name: data.name,
      fullDomain: `${data.name}.mockapi.dev`,
      lastModified: 'Just now',
    };
    MOCK_ENVIRONMENTS[index] = updatedEnv;
    return { ...updatedEnv };
  },
  delete: async (id: string): Promise<void> => {
    if (CALL_API) {
      return apiClient.delete<void>(`/subdomains/${id}`);
    }
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_ENVIRONMENTS.findIndex(e => e.id === id);
    if (index !== -1) {
      MOCK_ENVIRONMENTS.splice(index, 1);
    }
  }
};
