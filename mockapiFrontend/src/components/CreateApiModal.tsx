import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HttpMethod, CreateEndpointData, Endpoint } from '../types';

interface CreateApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEndpointData) => void;
  isLoading: boolean;
  initialData?: Endpoint | null;
}

export const CreateApiModal: React.FC<CreateApiModalProps> = ({ isOpen, onClose, onSave, isLoading, initialData }) => {
  const [formData, setFormData] = useState<CreateEndpointData>({
    method: 'GET',
    path: '',
    statusCode: 200,
    responseBody: '{\n  "message": "Success"\n}',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.path) newErrors.path = 'Path is required';
    if (formData.path && !formData.path.startsWith('/')) newErrors.path = 'Must start with /';
    if (!formData.responseBody) newErrors.responseBody = 'Response body is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          method: initialData.method,
          path: initialData.path,
          statusCode: initialData.statusCode,
          responseBody: initialData.responseBody || '',
        });
      } else {
        setFormData({
          method: 'GET',
          path: '',
          statusCode: 200,
          responseBody: '{\n  "message": "Success"\n}',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[700px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {isEdit ? 'Edit Mock API' : 'Create Mock API'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Method */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Method
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodColor(formData.method)}`}>
                      {formData.method}
                    </span>
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                {/* Path */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Path</label>
                  <input
                    type="text"
                    placeholder="/users"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    className={`w-full h-11 px-4 rounded-lg border font-mono text-sm transition-all outline-none ${
                      errors.path ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  <p className={`text-[11px] ${errors.path ? 'text-red-500' : 'text-slate-400'}`}>
                    {errors.path || 'Must start with /'}
                  </p>
                </div>

                {/* Status Code */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Status Code</label>
                  <input
                    type="number"
                    value={formData.statusCode}
                    onChange={(e) => setFormData({ ...formData, statusCode: parseInt(e.target.value) })}
                    className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Response Body */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Response Body</label>
                <textarea
                  value={formData.responseBody}
                  onChange={(e) => setFormData({ ...formData, responseBody: e.target.value })}
                  className={`w-full h-[200px] p-4 rounded-lg border font-mono text-sm transition-all outline-none resize-none ${
                    errors.responseBody ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                  placeholder='{ "message": "hello" }'
                />
                {errors.responseBody && <p className="text-[11px] text-red-500">{errors.responseBody}</p>}
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-lg">{isEdit ? 'save' : 'add'}</span>
                )}
                {isEdit ? 'Save Changes' : 'Create API'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
