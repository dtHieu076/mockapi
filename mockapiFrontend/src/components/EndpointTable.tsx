import React from 'react';
import { Endpoint } from '../types';

interface EndpointTableProps {
  endpoints: Endpoint[];
  onEdit: (endpoint: Endpoint) => void;
  onDelete: (id: string) => void;
}

export const EndpointTable: React.FC<EndpointTableProps> = ({ endpoints, onEdit, onDelete }) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-700 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PUT': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Method</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Endpoint Path</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Status Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Last Modified</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {endpoints.map((endpoint) => (
              <tr key={endpoint.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <code className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                    {endpoint.statusCode}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                  {endpoint.lastModified}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(endpoint)}
                      className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(endpoint.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-500">Showing {endpoints.length} of {endpoints.length} endpoints</p>
        <div className="flex gap-2">
          <button className="p-1 border border-slate-200 rounded-md bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-1 border border-slate-200 rounded-md bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
