/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type DatabaseType = 'POSTGRESQL' | 'MYSQL';
export type DatabaseMode = 'SHARED' | 'PER_SUBDOMAIN';

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

// Database types
export interface DatabaseConnection {
  id: string;
  accountId: string;
  name: string;
  databaseType: DatabaseType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
  mode: DatabaseMode;
  isActive: boolean;
  createdAt: string;
}

export interface Column {
  name: string;
  type: string;
  typeGeneric?: string;
  size?: number;
  precision?: number;
  scale?: number;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  defaultValue?: string;
  comment?: string;
}

export interface Table {
  name: string;
  schema?: string;
  rowCount?: number;
  columns?: Column[];
}

export interface Row {
  data: Record<string, any>;
  id?: any;
}

export interface CreateDatabaseRequest {
  name: string;
  databaseType: DatabaseType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  mode: DatabaseMode;
}

export interface CreateTableRequest {
  tableName: string;
  columns: Column[];
}
