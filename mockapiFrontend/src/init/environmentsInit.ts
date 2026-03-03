import { environmentApi } from '../api/environmentApi';
import { CreateEnvironmentData } from '../types';

export const useEnvironmentsInit = (context: any) => {
  const loadEnvironments = async () => {
    if (!context.user?.id) return;
    context.setLoading(true);
    try {
      const data = await environmentApi.getAll(context.user.id);
      context.setEnvironments(data);
    } catch (err) {
      context.setError('Failed to load environments');
    } finally {
      context.setLoading(false);
    }
  };

  const createEnvironment = async (data: CreateEnvironmentData) => {
    if (!context.user?.id) return;
    context.setLoading(true);
    try {
      await environmentApi.create(context.user.id, data);
      const updatedData = await environmentApi.getAll(context.user.id);
      context.setEnvironments(updatedData);
    } catch (err) {
      context.setError('Failed to create environment');
    } finally {
      context.setLoading(false);
    }
  };

  const updateEnvironment = async (id: string, data: CreateEnvironmentData) => {
    if (!context.user?.id) return;
    context.setLoading(true);
    try {
      await environmentApi.update(id, data);
      const updatedData = await environmentApi.getAll(context.user.id);
      context.setEnvironments(updatedData);
    } catch (err) {
      context.setError('Failed to update environment');
    } finally {
      context.setLoading(false);
    }
  };

  const deleteEnvironment = async (id: string) => {
    try {
      await environmentApi.delete(id);
      // Update state immediately without reloading
      context.setEnvironments(prev => prev.filter(env => env.id !== id));
    } catch (err) {
      context.setError('Failed to delete environment');
    }
  };

  return { loadEnvironments, createEnvironment, updateEnvironment, deleteEnvironment };
};
