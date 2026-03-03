import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, Environment, Endpoint, AccountEntity } from '../types';

interface GlobalContextType extends AppState {
  setEnvironments: (envs: Environment[]) => void;
  setSelectedEnvironment: (env: Environment | null) => void;
  setEndpoints: (endpoints: Endpoint[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: AccountEntity | null) => void;
  login: (user: AccountEntity) => void;
  logout: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    environments: [],
    selectedEnvironment: null,
    endpoints: [],
    isLoading: false,
    error: null,
    isAuthenticated: false,
  });

  const setEnvironments = (environments: Environment[]) => setState(prev => ({ ...prev, environments }));
  const setSelectedEnvironment = (selectedEnvironment: Environment | null) => setState(prev => ({ ...prev, selectedEnvironment }));
  const setEndpoints = (endpoints: Endpoint[]) => setState(prev => ({ ...prev, endpoints }));
  const setLoading = (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }));
  const setError = (error: string | null) => setState(prev => ({ ...prev, error }));
  const setUser = (user: AccountEntity | null) => setState(prev => ({ ...prev, user }));
  const login = (user: AccountEntity) => setState(prev => ({ ...prev, isAuthenticated: true, user }));
  const logout = () => setState(prev => ({ ...prev, isAuthenticated: false, user: null }));

  return (
    <GlobalContext.Provider value={{ 
      ...state, 
      setEnvironments, 
      setSelectedEnvironment, 
      setEndpoints, 
      setLoading, 
      setError,
      setUser,
      login,
      logout
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobalContext must be used within a GlobalProvider');
  return context;
};
