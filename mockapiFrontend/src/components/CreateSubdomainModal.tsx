import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Environment, CreateEnvironmentData } from '../types';

interface CreateSubdomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEnvironmentData) => void;
  isLoading: boolean;
  initialData?: Environment | null;
  apiError?: string | null;
}

export const CreateSubdomainModal: React.FC<CreateSubdomainModalProps> = ({ isOpen, onClose, onSave, isLoading, initialData, apiError }) => {
  const [formData, setFormData] = useState<CreateEnvironmentData>({
    name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) {
      newErrors.name = 'Subdomain name is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.name)) {
      newErrors.name = 'Only lowercase letters, numbers and "-" allowed';
    }

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
          name: initialData.name,
        });
      } else {
        setFormData({
          name: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

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
            className="relative w-full max-w-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {isEdit ? 'Edit Subdomain' : 'Create New Subdomain'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input
                  type="text"
                  placeholder="dev"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                  className={`w-full h-11 px-4 rounded-lg border transition-all outline-none text-sm ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                />
                <p className={`text-[11px] ${errors.name ? 'text-red-500' : 'text-slate-400'}`}>
                  {errors.name || "Only lowercase letters, numbers and '-' allowed"}
                </p>
              </div>

              {/* Domain Preview */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Domain Preview</label>
                <div className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center">
                  <span className="font-mono text-sm text-slate-500">
                    {formData.name || 'subdomain'}.dangthanhhieu076.id.vn
                  </span>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                  {apiError}
                </div>
              )}
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
                {isEdit ? 'Save Changes' : 'Create Subdomain'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
