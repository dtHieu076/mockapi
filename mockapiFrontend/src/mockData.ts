import { Environment, Endpoint } from './types';

export const MOCK_ENVIRONMENTS: Environment[] = [
  {
    id: '1',
    name: 'Production',
    fullDomain: 'hieu.mockapi.dev',
    status: 'active',
    description: 'Primary production environment for main application mockups. Connected to Stripe and AWS Lambda integrations.',
    apiCount: 12,
    lastModified: '2 mins ago',
  },
  {
    id: '2',
    name: 'Staging',
    fullDomain: 'staging-api.mockapi.dev',
    status: 'active',
    description: 'Staging environment for pre-release API testing. Syncs daily with production schemas.',
    apiCount: 8,
    lastModified: '1 hour ago',
  },
  {
    id: '3',
    name: 'Test',
    fullDomain: 'test-env.mockapi.dev',
    status: 'active',
    description: 'General purpose testing environment for team collaboration and bug reporting.',
    apiCount: 5,
    lastModified: '5 hours ago',
  },
  {
    id: '4',
    name: 'Sandbox',
    fullDomain: 'dev-sandbox.mockapi.dev',
    status: 'active',
    description: 'Isolated sandbox for experimental feature mocking and temporary prototyping.',
    apiCount: 3,
    lastModified: '1 day ago',
  },
  {
    id: '5',
    name: 'Alpha',
    fullDomain: 'alpha-test.mockapi.dev',
    status: 'inactive',
    description: 'Internal alpha environment for core service mocks. Currently under maintenance.',
    apiCount: 14,
    lastModified: '2 days ago',
  },
  {
    id: '6',
    name: 'Beta',
    fullDomain: 'beta-api.mockapi.dev',
    status: 'active',
    description: 'Public beta environment for third-party integration tests and partner sandbox access.',
    apiCount: 7,
    lastModified: '3 days ago',
  },
];

export const MOCK_ENDPOINTS: Record<string, Endpoint[]> = {
  '1': [
    { id: 'e1', method: 'GET', path: '/users', statusCode: 200, lastModified: '2 mins ago', responseBody: '[]' },
    { id: 'e2', method: 'POST', path: '/auth/login', statusCode: 201, lastModified: '1 hour ago', responseBody: '{}' },
    { id: 'e3', method: 'PUT', path: '/users/:id', statusCode: 200, lastModified: '5 hours ago', responseBody: '{}' },
    { id: 'e4', method: 'DELETE', path: '/posts/:id', statusCode: 204, lastModified: '1 day ago', responseBody: '' },
  ],
};
