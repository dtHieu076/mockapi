import React from 'react';
import { Environment } from '../types';

interface EnvironmentCardProps {
  environment: Environment;
  onManage: (id: string) => void;
  onEdit: (env: Environment) => void;
  onDelete: (id: string) => void;
}

export const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ environment, onManage, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-sm font-medium text-primary">{environment.fullDomain}</span>
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${environment.status === 'active'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-500'
            }`}>
            <span className={`size-1.5 rounded-full ${environment.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            {environment.status || 'active'}
          </span>
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">
        {environment.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(environment)}
            className="text-slate-400 hover:text-primary p-1.5 rounded-md hover:bg-slate-50 transition-colors"
            title="Edit Subdomain"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={() => onDelete(environment.id)}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
            title="Delete Subdomain"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
        <button
          onClick={() => onManage(environment.id)}
          className="bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Manage APIs
        </button>
      </div>
    </div>
  );
};
