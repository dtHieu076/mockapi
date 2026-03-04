import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { databaseApi } from '../api/databaseApi';
import { DatabaseConnection, Table, Column, Row, CreateDatabaseRequest, DatabaseType } from '../types';
import { motion } from 'motion/react';

type ViewMode = 'list' | 'tables' | 'table-detail';
type TableDetailTab = 'columns' | 'data';

export const DatabasePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useGlobalContext();
    const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedDb, setSelectedDb] = useState<DatabaseConnection | null>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [columns, setColumns] = useState<Column[]>([]);
    const [rows, setRows] = useState<Row[]>([]);
    const [tableDetailTab, setTableDetailTab] = useState<TableDetailTab>('data');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Modal states
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
    const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
    const [isEditRowModalOpen, setIsEditRowModalOpen] = useState(false);
    const [isDeleteRowModalOpen, setIsDeleteRowModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<Row | null>(null);
    const [deletingRowId, setDeletingRowId] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState<CreateDatabaseRequest>({
        name: '',
        databaseType: 'POSTGRESQL',
        host: 'localhost',
        port: 5432,
        databaseName: '',
        username: '',
        password: '',
        mode: 'SHARED',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [newColumn, setNewColumn] = useState({
        name: '',
        type: 'VARCHAR(255)',
        isNullable: true,
        isPrimaryKey: false,
        isAutoIncrement: false,
    });

    const [newColumnErrors, setNewColumnErrors] = useState<Record<string, string>>({});

    const [newRowData, setNewRowData] = useState<Record<string, any>>({});
    const [newRowErrors, setNewRowErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadDatabases();
    }, []);

    const loadDatabases = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const data = await databaseApi.listDatabases(user.id);
            setDatabases(data);
        } catch (err) {
            console.error('Failed to load databases:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDatabase = async () => {
        if (!user) return;
        if (!validateForm()) return;
        try {
            await databaseApi.createDatabase(user.id, formData);
            await loadDatabases();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Failed to create database:', err);
        }
    };

    const handleDeleteDatabase = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this database connection?')) return;
        try {
            await databaseApi.deleteDatabase(id);
            await loadDatabases();
        } catch (err) {
            console.error('Failed to delete database:', err);
        }
    };

    const handleTestConnection = async () => {
        setIsTestLoading(true);
        setTestResult(null);
        try {
            const success = await databaseApi.testConnection(formData);
            setTestResult({
                success,
                message: success ? 'Connection successful!' : 'Connection failed. Please check your credentials.',
            });
        } catch (err) {
            setTestResult({
                success: false,
                message: 'Connection failed. Please check your credentials.',
            });
        } finally {
            setIsTestLoading(false);
        }
    };

    const handleSelectDatabase = async (db: DatabaseConnection) => {
        setSelectedDb(db);
        setViewMode('tables');
        try {
            const tablesData = await databaseApi.listTables(db.id);
            setTables(tablesData);
        } catch (err) {
            console.error('Failed to load tables:', err);
        }
    };

    const handleSelectTable = async (tableName: string) => {
        if (!selectedDb) return;
        setSelectedTable(tableName);
        setViewMode('table-detail');
        setTableDetailTab('data');
        try {
            const [columnsData, rowsData] = await Promise.all([
                databaseApi.listColumns(selectedDb.id, tableName),
                databaseApi.listRows(selectedDb.id, tableName, 50, 0),
            ]);
            setColumns(columnsData);
            setRows(rowsData);
            // Initialize newRowData with empty values for each column
            const initialData: Record<string, any> = {};
            columnsData.forEach(col => {
                initialData[col.name] = '';
            });
            setNewRowData(initialData);
        } catch (err) {
            console.error('Failed to load table data:', err);
        }
    };

    const handleDeleteTable = async (tableName: string) => {
        if (!selectedDb || !window.confirm(`Are you sure you want to delete table "${tableName}"?`)) return;
        try {
            await databaseApi.dropTable(selectedDb.id, tableName);
            const tablesData = await databaseApi.listTables(selectedDb.id);
            setTables(tablesData);
        } catch (err) {
            console.error('Failed to delete table:', err);
        }
    };

    const handleAddColumn = async () => {
        if (!selectedDb || !selectedTable) return;
        if (!validateColumn()) return;
        try {
            await databaseApi.addColumn(selectedDb.id, selectedTable, newColumn);
            const columnsData = await databaseApi.listColumns(selectedDb.id, selectedTable);
            setColumns(columnsData);
            setIsAddColumnModalOpen(false);
            setNewColumnErrors({});
            setNewColumn({
                name: '',
                type: 'VARCHAR(255)',
                isNullable: true,
                isPrimaryKey: false,
                isAutoIncrement: false,
            });
        } catch (err) {
            console.error('Failed to add column:', err);
        }
    };

    const handleDeleteColumn = async (columnName: string) => {
        if (!selectedDb || !selectedTable || !window.confirm(`Are you sure you want to delete column "${columnName}"?`)) return;
        try {
            await databaseApi.dropColumn(selectedDb.id, selectedTable, columnName);
            const columnsData = await databaseApi.listColumns(selectedDb.id, selectedTable);
            setColumns(columnsData);
        } catch (err) {
            console.error('Failed to delete column:', err);
        }
    };

    const handleAddRow = async () => {
        if (!selectedDb || !selectedTable) return;
        if (!validateRow()) return;
        try {
            await databaseApi.insertRow(selectedDb.id, selectedTable, newRowData);
            const rowsData = await databaseApi.listRows(selectedDb.id, selectedTable, 50, 0);
            setRows(rowsData);
            setIsAddRowModalOpen(false);
            setNewRowErrors({});
            // Reset form
            const initialData: Record<string, any> = {};
            columns.forEach(col => {
                initialData[col.name] = '';
            });
            setNewRowData(initialData);
        } catch (err) {
            console.error('Failed to add row:', err);
        }
    };

    const handleUpdateRow = async () => {
        if (!selectedDb || !selectedTable || !editingRow || !editingRow.id) return;
        try {
            await databaseApi.updateRow(selectedDb.id, selectedTable, String(editingRow.id), editingRow.data);
            const rowsData = await databaseApi.listRows(selectedDb.id, selectedTable, 50, 0);
            setRows(rowsData);
            setEditingRow(null);
        } catch (err) {
            console.error('Failed to update row:', err);
        }
    };

    const handleDeleteRow = async (rowId: string) => {
        if (!selectedDb || !selectedTable || !window.confirm('Are you sure you want to delete this row?')) return;
        try {
            await databaseApi.deleteRow(selectedDb.id, selectedTable, rowId);
            const rowsData = await databaseApi.listRows(selectedDb.id, selectedTable, 50, 0);
            setRows(rowsData);
        } catch (err) {
            console.error('Failed to delete row:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            databaseType: 'POSTGRESQL',
            host: 'localhost',
            port: 5432,
            databaseName: '',
            username: '',
            password: '',
            mode: 'SHARED',
        });
        setFormErrors({});
        setTestResult(null);
    };

    // Validation functions
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Connection name is required';
        }
        if (!formData.host.trim()) {
            errors.host = 'Host is required';
        }
        if (!formData.databaseName.trim()) {
            errors.databaseName = 'Database name is required';
        }
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateColumn = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newColumn.name.trim()) {
            errors.name = 'Column name is required';
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newColumn.name)) {
            errors.name = 'Invalid column name (start with letter or _)';
        }

        setNewColumnErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateRow = (): boolean => {
        const errors: Record<string, string> = {};

        columns.forEach(col => {
            if (col.isPrimaryKey && !newRowData[col.name]?.trim()) {
                errors[col.name] = `${col.name} is required (primary key)`;
            }
        });

        setNewRowErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDatabaseTypeChange = (type: DatabaseType) => {
        setFormData({
            ...formData,
            databaseType: type,
            port: type === 'POSTGRESQL' ? 5432 : 3306,
        });
    };

    if (isLoading) {
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
            className="flex flex-col gap-6"
        >
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    {/* <button
                        onClick={onBack}
                        className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline mb-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back
                    </button> */}
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                        <span className="material-symbols-outlined text-sm">storage</span>
                        Database Management
                    </div>
                    <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">
                        {viewMode === 'list' ? 'Your Databases' : selectedDb?.name}
                    </h1>
                </div>
                {viewMode === 'list' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        <span>Add Database</span>
                    </button>
                )}
                {viewMode === 'tables' && (
                    <button
                        onClick={() => setViewMode('list')}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Databases
                    </button>
                )}
                {viewMode === 'table-detail' && (
                    <button
                        onClick={() => {
                            setViewMode('tables');
                            setSelectedTable(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Tables
                    </button>
                )}
            </div>

            {/* Tabs */}
            {viewMode === 'table-detail' && selectedTable && (
                <div className="flex border-b border-slate-200">
                    <button
                        className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${tableDetailTab === 'columns'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setTableDetailTab('columns')}
                    >
                        <span className="material-symbols-outlined text-xl">view_column</span>
                        Columns
                        <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{columns.length}</span>
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${tableDetailTab === 'data'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setTableDetailTab('data')}
                    >
                        <span className="material-symbols-outlined text-xl">grid_on</span>
                        Data Rows
                        <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{rows.length}</span>
                    </button>
                </div>
            )}

            {/* List View - Databases */}
            {viewMode === 'list' && (
                <>
                    {databases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-4xl text-slate-400">storage</span>
                            </div>
                            <p className="text-slate-500 text-lg">No databases connected yet</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-primary font-semibold hover:underline"
                            >
                                Add your first database
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {databases.map((db) => (
                                <div
                                    key={db.id}
                                    className="flex flex-col p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{db.databaseType}</span>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${db.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {db.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{db.name}</h3>
                                        <p className="text-sm text-slate-500">{db.mode}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => handleSelectDatabase(db)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90"
                                        >
                                            <span className="material-symbols-outlined text-lg">login</span>
                                            Connect
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDatabase(db.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Tables View */}
            {viewMode === 'tables' && selectedDb && (
                <>
                    {tables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-4xl text-slate-400">table_chart</span>
                            </div>
                            <p className="text-slate-500 text-lg">No tables found in this database</p>
                        </div>
                    ) : (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-6 py-3 font-semibold text-slate-600 text-sm">Table Name</th>
                                        <th className="text-left px-6 py-3 font-semibold text-slate-600 text-sm">Schema</th>
                                        <th className="text-right px-6 py-3 font-semibold text-slate-600 text-sm">Rows</th>
                                        <th className="text-right px-6 py-3 font-semibold text-slate-600 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {tables.map((table) => (
                                        <tr key={table.name} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleSelectTable(table.name)}
                                                    className="flex items-center gap-2 text-primary font-medium hover:underline"
                                                >
                                                    <span className="material-symbols-outlined">table_chart</span>
                                                    {table.name}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{table.schema || 'public'}</td>
                                            <td className="px-6 py-4 text-right text-slate-500">{table.rowCount || 0}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteTable(table.name)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Table Detail View */}
            {viewMode === 'table-detail' && selectedDb && selectedTable && (
                <>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between py-2 px-1">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">table_chart</span>
                            <span className="font-semibold text-slate-700">{selectedTable}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {tableDetailTab === 'columns' ? (
                                <button
                                    onClick={() => setIsAddColumnModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Add Column
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsAddRowModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Add Row
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Columns Tab */}
                    {tableDetailTab === 'columns' && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-sm">Name</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-sm">Type</th>
                                        <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-sm">Nullable</th>
                                        <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-sm">Primary Key</th>
                                        <th className="text-center px-4 py-2.5 font-semibold text-slate-600 text-sm">Auto Inc</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-sm"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {columns.map((col) => (
                                        <tr key={col.name} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{col.name}</td>
                                            <td className="px-4 py-3 text-slate-500 font-mono text-sm">{col.type}</td>
                                            <td className="px-4 py-3 text-center">
                                                {col.isNullable ? (
                                                    <span className="text-green-600 text-sm">✓</span>
                                                ) : (
                                                    <span className="text-red-600 text-sm">✗</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {col.isPrimaryKey ? (
                                                    <span className="material-symbols-outlined text-yellow-500 text-lg">key</span>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {col.isAutoIncrement ? (
                                                    <span className="material-symbols-outlined text-blue-500 text-lg">counter</span>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteColumn(col.name)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Data Rows Tab */}
                    {tableDetailTab === 'data' && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 w-20"></th>
                                            {columns.map((col) => (
                                                <th key={col.name} className="text-left px-4 py-2.5 font-semibold text-slate-600 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        {col.isPrimaryKey && (
                                                            <span className="material-symbols-outlined text-yellow-500 text-xs">key</span>
                                                        )}
                                                        {col.name}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {rows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingRow(row);
                                                                setIsEditRowModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (row.id) {
                                                                    setDeletingRowId(String(row.id));
                                                                    setIsDeleteRowModalOpen(true);
                                                                }
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                                {columns.map((col) => (
                                                    <td key={col.name} className="px-4 py-3 text-slate-700 font-mono text-sm max-w-xs truncate">
                                                        {row.data[col.name] !== null ? String(row.data[col.name]) : <span className="text-slate-300 italic">NULL</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Create Database Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Database Connection</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Connection Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="My Database"
                                />
                            </div>

                            {/* Database Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Database Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dbType"
                                            checked={formData.databaseType === 'POSTGRESQL'}
                                            onChange={() => handleDatabaseTypeChange('POSTGRESQL')}
                                            className="text-primary"
                                        />
                                        <span>PostgreSQL</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dbType"
                                            checked={formData.databaseType === 'MYSQL'}
                                            onChange={() => handleDatabaseTypeChange('MYSQL')}
                                            className="text-primary"
                                        />
                                        <span>MySQL</span>
                                    </label>
                                </div>
                            </div>

                            {/* Host & Port */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Host</label>
                                    <input
                                        type="text"
                                        value={formData.host}
                                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="localhost"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                                    <input
                                        type="number"
                                        value={formData.port}
                                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Database Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Database Name</label>
                                <input
                                    type="text"
                                    value={formData.databaseName}
                                    onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="mydb"
                                />
                            </div>

                            {/* Username & Password */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Mode */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Database Mode</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mode"
                                            checked={formData.mode === 'SHARED'}
                                            onChange={() => setFormData({ ...formData, mode: 'SHARED' })}
                                            className="text-primary"
                                        />
                                        <span>Shared</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="mode"
                                            checked={formData.mode === 'PER_SUBDOMAIN'}
                                            onChange={() => setFormData({ ...formData, mode: 'PER_SUBDOMAIN' })}
                                            className="text-primary"
                                        />
                                        <span>Per Subdomain</span>
                                    </label>
                                </div>
                            </div>

                            {/* Test Connection */}
                            <div>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTestLoading}
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {isTestLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-700"></div>
                                    ) : (
                                        <span className="material-symbols-outlined">wifi_tethering</span>
                                    )}
                                    Test Connection
                                </button>
                                {testResult && (
                                    <div
                                        className={`mt-2 px-4 py-2 rounded-lg text-sm ${testResult.success
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {testResult.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDatabase}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Column Modal */}
            {isAddColumnModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Column</h2>
                            <button
                                onClick={() => setIsAddColumnModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Column Name</label>
                                <input
                                    type="text"
                                    value={newColumn.name}
                                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="column_name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data Type</label>
                                <select
                                    value={newColumn.type}
                                    onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="INTEGER">INTEGER</option>
                                    <option value="BIGINT">BIGINT</option>
                                    <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                                    <option value="BOOLEAN">BOOLEAN</option>
                                    <option value="DATE">DATE</option>
                                    <option value="TIMESTAMP">TIMESTAMP</option>
                                    <option value="UUID">UUID</option>
                                    <option value="JSONB">JSONB</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newColumn.isNullable}
                                        onChange={(e) => setNewColumn({ ...newColumn, isNullable: e.target.checked })}
                                        className="text-primary rounded"
                                    />
                                    <span className="text-sm text-slate-700">Nullable</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newColumn.isPrimaryKey}
                                        onChange={(e) => setNewColumn({ ...newColumn, isPrimaryKey: e.target.checked })}
                                        className="text-primary rounded"
                                    />
                                    <span className="text-sm text-slate-700">Primary Key</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newColumn.isAutoIncrement}
                                        onChange={(e) => setNewColumn({ ...newColumn, isAutoIncrement: e.target.checked })}
                                        className="text-primary rounded"
                                    />
                                    <span className="text-sm text-slate-700">Auto Increment</span>
                                </label>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddColumnModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddColumn}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                                Add Column
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Row Modal */}
            {isAddRowModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Row</h2>
                            <button
                                onClick={() => setIsAddRowModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {columns.map((col) => (
                                <div key={col.name}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {col.name}
                                        {col.isPrimaryKey && <span className="text-yellow-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={newRowData[col.name] || ''}
                                        onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                                        placeholder={col.type}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddRowModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddRow}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                                Add Row
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Row Modal */}
            {isEditRowModalOpen && editingRow && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Edit Row</h2>
                            <button
                                onClick={() => {
                                    setIsEditRowModalOpen(false);
                                    setEditingRow(null);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {columns.map((col) => (
                                <div key={col.name}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {col.name}
                                        {col.isPrimaryKey && <span className="text-yellow-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={editingRow.data[col.name] || ''}
                                        onChange={(e) => setEditingRow({
                                            ...editingRow,
                                            data: { ...editingRow.data, [col.name]: e.target.value }
                                        })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                                        placeholder={col.type}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsEditRowModalOpen(false);
                                    setEditingRow(null);
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await handleUpdateRow();
                                    setIsEditRowModalOpen(false);
                                    setEditingRow(null);
                                }}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteRowModalOpen && deletingRowId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 flex flex-col items-center gap-4">
                            <div className="p-4 bg-red-100 rounded-full">
                                <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                            </div>
                            <h2 className="text-xl font-bold text-center">Delete Row</h2>
                            <p className="text-slate-500 text-center">
                                Are you sure you want to delete this row? This action cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteRowModalOpen(false);
                                    setDeletingRowId(null);
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await handleDeleteRow(deletingRowId);
                                    setIsDeleteRowModalOpen(false);
                                    setDeletingRowId(null);
                                }}
                                className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

