/**
 * API Client
 * Handles real network requests to the backend via Nginx reverse proxy.
 * 
 * IMPORTANT: Uses relative path to work with Nginx reverse proxy.
 * All API calls go through Nginx which proxies /api/* to the backend.
 * This eliminates CORS issues and enables wildcard subdomain architecture.
 */

export const BASE_URL = ''; // Relative path - Nginx handles routing

export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    console.log(`[API] GET ${url}`);
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json() as T;
  },
  post: async <T>(url: string, data: any): Promise<T> => {
    console.log(`[API] POST ${url}`, data);
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json() as T;
  },
  put: async <T>(url: string, data: any): Promise<T> => {
    console.log(`[API] PUT ${url}`, data);
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json() as T;
  },
  delete: async <T>(url: string): Promise<T> => {
    console.log(`[API] DELETE ${url}`);
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json() as T;
  }
};
