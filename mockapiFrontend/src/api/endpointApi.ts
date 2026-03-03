import { apiClient } from './apiClient';
import { Endpoint, CreateEndpointData } from '../types';
import { MOCK_ENDPOINTS } from '../mockData';

const CALL_API = true;

export const endpointApi = {
  getByEnvironmentId: async (envId: string): Promise<Endpoint[]> => {
    if (CALL_API) {
      return apiClient.get<Endpoint[]>(`/apis/${envId}`);
    }
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...(MOCK_ENDPOINTS[envId] || [])];
  },
  create: async (envId: string, data: CreateEndpointData): Promise<Endpoint> => {
    if (CALL_API) {
      return apiClient.post<Endpoint>(`/apis/${envId}`, data);
    }

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));
    const newEndpoint: Endpoint = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      lastModified: 'Just now',
    };

    if (!MOCK_ENDPOINTS[envId]) MOCK_ENDPOINTS[envId] = [];
    MOCK_ENDPOINTS[envId].unshift(newEndpoint);

    return { ...newEndpoint };
  },
  update: async (endpointId: string, data: CreateEndpointData): Promise<Endpoint> => {
    if (CALL_API) {
      return apiClient.put<Endpoint>(`/apis/${endpointId}`, data);
    }

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find endpoint in any environment
    for (const envId in MOCK_ENDPOINTS) {
      const index = MOCK_ENDPOINTS[envId].findIndex(e => e.id === endpointId);
      if (index !== -1) {
        const updatedEndpoint: Endpoint = {
          ...MOCK_ENDPOINTS[envId][index],
          ...data,
          lastModified: 'Just now',
        };
        MOCK_ENDPOINTS[envId][index] = updatedEndpoint;
        return { ...updatedEndpoint };
      }
    }
    throw new Error('Endpoint not found');
  },
  delete: async (endpointId: string): Promise<void> => {
    if (CALL_API) {
      return apiClient.delete<void>(`/apis/${endpointId}`);
    }

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));

    for (const envId in MOCK_ENDPOINTS) {
      const index = MOCK_ENDPOINTS[envId].findIndex(e => e.id === endpointId);
      if (index !== -1) {
        MOCK_ENDPOINTS[envId].splice(index, 1);
        return;
      }
    }
  }
};
