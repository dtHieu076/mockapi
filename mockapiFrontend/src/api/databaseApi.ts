import { BASE_URL } from './apiClient';
import { DatabaseConnection, Table, Column, Row, CreateDatabaseRequest, CreateTableRequest } from '../types';

export const databaseApi = {
    // Connection Management
    listDatabases: async (accountId: string): Promise<DatabaseConnection[]> => {
        const response = await fetch(`${BASE_URL}/api/databases?accountId=${accountId}`);
        if (!response.ok) throw new Error('Failed to fetch databases');
        return response.json();
    },

    getDatabase: async (id: string): Promise<DatabaseConnection> => {
        const response = await fetch(`${BASE_URL}/api/databases/${id}`);
        if (!response.ok) throw new Error('Failed to fetch database');
        return response.json();
    },

    createDatabase: async (accountId: string, data: CreateDatabaseRequest): Promise<DatabaseConnection> => {
        const response = await fetch(`${BASE_URL}/api/databases?accountId=${accountId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create database');
        return response.json();
    },

    updateDatabase: async (id: string, data: Partial<DatabaseConnection>): Promise<DatabaseConnection> => {
        const response = await fetch(`${BASE_URL}/api/databases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update database');
        return response.json();
    },

    deleteDatabase: async (id: string): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete database');
    },

    testConnection: async (data: Partial<CreateDatabaseRequest>): Promise<boolean> => {
        const response = await fetch(`${BASE_URL}/api/databases/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) return false;
        return response.json();
    },

    // Table Operations
    listTables: async (databaseId: string): Promise<Table[]> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables`);
        if (!response.ok) throw new Error('Failed to fetch tables');
        return response.json();
    },

    createTable: async (databaseId: string, data: CreateTableRequest): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create table');
    },

    dropTable: async (databaseId: string, tableName: string): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to drop table');
    },

    // Column Operations
    listColumns: async (databaseId: string, tableName: string): Promise<Column[]> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/columns`);
        if (!response.ok) throw new Error('Failed to fetch columns');
        return response.json();
    },

    addColumn: async (databaseId: string, tableName: string, column: Column): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/columns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(column),
        });
        if (!response.ok) throw new Error('Failed to add column');
    },

    dropColumn: async (databaseId: string, tableName: string, columnName: string): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/columns/${encodeURIComponent(columnName)}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to drop column');
    },

    // Row Operations
    listRows: async (databaseId: string, tableName: string, limit: number = 50, offset: number = 0): Promise<Row[]> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/rows?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Failed to fetch rows');
        return response.json();
    },

    getRowCount: async (databaseId: string, tableName: string): Promise<number> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/rows/count`);
        if (!response.ok) throw new Error('Failed to fetch row count');
        return response.json();
    },

    insertRow: async (databaseId: string, tableName: string, data: Record<string, any>): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/rows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to insert row');
    },

    updateRow: async (databaseId: string, tableName: string, rowId: string, data: Record<string, any>): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/rows/${encodeURIComponent(rowId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update row');
    },

    deleteRow: async (databaseId: string, tableName: string, rowId: string): Promise<void> => {
        const response = await fetch(`${BASE_URL}/api/databases/${databaseId}/tables/${encodeURIComponent(tableName)}/rows/${encodeURIComponent(rowId)}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete row');
    },
};

