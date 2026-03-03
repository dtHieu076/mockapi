import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { useEnvironmentsInit } from '../init/environmentsInit';
import { EnvironmentCard } from '../components/EnvironmentCard';
import { CreateSubdomainModal } from '../components/CreateSubdomainModal';
import { motion } from 'motion/react';
import { Environment, CreateEnvironmentData } from '../types';

export const EnvironmentsPage: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const context = useGlobalContext();
  const { loadEnvironments, createEnvironment, updateEnvironment, deleteEnvironment } = useEnvironmentsInit(context);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);

  useEffect(() => {
    loadEnvironments();
  }, []);

  const handleCreateSubdomain = async (data: CreateEnvironmentData) => {
    try {
      if (editingEnv) {
        await updateEnvironment(editingEnv.id, data);
      } else {
        await createEnvironment(data);
      }
      setIsModalOpen(false);
      setEditingEnv(null);
    } catch (err) {
      // Error is already set in context, don't close modal
    }
  };

  const handleEdit = (env: Environment) => {
    setEditingEnv(env);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subdomain? All associated APIs will be lost.')) {
      await deleteEnvironment(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEnv(null);
  };

  if (context.isLoading && context.environments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-12"
    >
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tight mb-2">Your Mock API Environments</h1>
          <p className="text-slate-500 text-lg">Manage and monitor your subdomain endpoints and mock data configurations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Create Subdomain</span>
        </button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {context.environments.map((env) => (
          <EnvironmentCard
            key={env.id}
            environment={env}
            onManage={onSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-10">
        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button className="size-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">2</button>
        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">3</button>
        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <CreateSubdomainModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateSubdomain}
        isLoading={context.isLoading}
        initialData={editingEnv}
      />
    </motion.div>
  );
};
