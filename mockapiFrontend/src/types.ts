/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface AccountEntity {
  id: string;
  username: string;
  password?: string;
  createdAt: string;
}

export interface Environment {
  id: string;
  name: string;
  fullDomain: string;
  // UI fields that might not be in backend but we use
  status?: 'active' | 'inactive';
  description?: string;
  apiCount?: number;
  lastModified?: string;
}

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  responseBody: string;
  // UI fields
  lastModified?: string;
}

export interface CreateEndpointData {
  method: string;
  path: string;
  statusCode: number;
  responseBody: string;
}

export interface CreateEnvironmentData {
  name: string;
}

export interface AppState {
  user: AccountEntity | null;
  environments: Environment[];
  selectedEnvironment: Environment | null;
  endpoints: Endpoint[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
