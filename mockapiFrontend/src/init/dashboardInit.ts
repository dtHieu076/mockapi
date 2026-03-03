import { environmentApi } from '../api/environmentApi';
import { endpointApi } from '../api/endpointApi';
import { CreateEndpointData } from '../types';

export const useDashboardInit = (context: any) => {
  const loadDashboard = async (envId: string) => {
    if (!context.user?.id) return;
    context.setLoading(true);
    try {
      const env = await environmentApi.getById(context.user.id, envId);
      const endpoints = await endpointApi.getByEnvironmentId(envId);
      context.setSelectedEnvironment(env || null);
      context.setEndpoints(endpoints);
    } catch (err) {
      context.setError('Failed to load dashboard data');
    } finally {
      context.setLoading(false);
    }
  };

  const createEndpoint = async (envId: string, data: CreateEndpointData) => {
    context.setLoading(true);
    try {
      await endpointApi.create(envId, data);
      // Refresh endpoints
      const endpoints = await endpointApi.getByEnvironmentId(envId);
      context.setEndpoints(endpoints);
    } catch (err) {
      context.setError('Failed to create endpoint');
    } finally {
      context.setLoading(false);
    }
  };

  const updateEndpoint = async (envId: string, endpointId: string, data: CreateEndpointData) => {
    context.setLoading(true);
    try {
      await endpointApi.update(endpointId, data);
      // Refresh endpoints
      const endpoints = await endpointApi.getByEnvironmentId(envId);
      context.setEndpoints(endpoints);
    } catch (err) {
      context.setError('Failed to update endpoint');
    } finally {
      context.setLoading(false);
    }
  };

  const deleteEndpoint = async (envId: string, endpointId: string) => {
    try {
      await endpointApi.delete(endpointId);
      // Update state immediately without reloading
      context.setEndpoints(prev => prev.filter(ep => ep.id !== endpointId));
    } catch (err) {
      context.setError('Failed to delete endpoint');
    }
  };

  const resetSelection = () => {
    context.setSelectedEnvironment(null);
    context.setEndpoints([]);
  };

  return { loadDashboard, createEndpoint, updateEndpoint, deleteEndpoint, resetSelection };
};
