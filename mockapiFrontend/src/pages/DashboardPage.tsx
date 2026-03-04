import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { useDashboardInit } from '../init/dashboardInit';
import { EndpointTable } from '../components/EndpointTable';
import { CreateApiModal } from '../components/CreateApiModal';
import { motion } from 'motion/react';
import { CreateEndpointData, Endpoint } from '../types';

export const DashboardPage: React.FC<{ envId: string; onBack: () => void }> = ({ envId, onBack }) => {
  const context = useGlobalContext();
  const { loadDashboard, createEndpoint, updateEndpoint, deleteEndpoint } = useDashboardInit(context);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);

  useEffect(() => {
    loadDashboard(envId);
  }, [envId]);

  const handleSaveApi = async (data: CreateEndpointData) => {
    if (editingEndpoint) {
      await updateEndpoint(envId, editingEndpoint.id, data);
    } else {
      await createEndpoint(envId, data);
    }
    setIsModalOpen(false);
    setEditingEndpoint(null);
  };

  const handleEdit = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this API endpoint?')) {
      await deleteEndpoint(envId, id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEndpoint(null);
  };

  if (context.isLoading && !context.selectedEnvironment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline mb-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Environments
          </button>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <span className="material-symbols-outlined text-sm">link</span>
            Active Subdomain
          </div>
          <h1 className="text-slate-900 text-4xl font-extrabold tracking-tight">
            {context.selectedEnvironment?.fullDomain}
          </h1>
          <p className="text-slate-500 text-base">
            {context.selectedEnvironment?.name}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span>Create API</span>
        </button>
      </div>

      <div className="flex border-b border-slate-200 gap-8">
        <a className="flex items-center gap-2 border-b-2 border-primary text-primary pb-4 pt-2 font-bold text-sm transition-all" href="#">
          <span className="material-symbols-outlined text-xl">dataset</span>
          Endpoints
        </a>
        <a className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-4 pt-2 font-medium text-sm transition-all" href="#">
          <span className="material-symbols-outlined text-xl">schema</span>
          Data Schema
        </a>
        <a className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 pb-4 pt-2 font-medium text-sm transition-all" href="#">
          <span className="material-symbols-outlined text-xl">settings</span>
          Project Settings
        </a>
      </div>

      <EndpointTable
        endpoints={context.endpoints}
        onEdit={handleEdit}
        onDelete={handleDelete}
        fullDomain={context.selectedEnvironment?.fullDomain}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined">file_download</span>
            </div>
            <div>
              <p className="text-slate-900 text-base font-bold leading-tight">Quick Export</p>
              <p className="text-slate-500 text-sm">Download your API docs as OpenAPI JSON.</p>
            </div>
          </div>
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors">
            Export JSON
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined">auto_graph</span>
            </div>
            <div>
              <p className="text-slate-900 text-base font-bold leading-tight">Traffic Metrics</p>
              <p className="text-slate-500 text-sm">View request history and throughput stats.</p>
            </div>
          </div>
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-9 px-4 border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors">
            View Logs
          </button>
        </div>
      </div>

      <CreateApiModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveApi}
        isLoading={context.isLoading}
        initialData={editingEndpoint}
      />
    </motion.div>
  );
};
