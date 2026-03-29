import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import StatCard from '../components/StatCard';
import Toast from '../components/Toast';

const Dashboard = () => {
  const { user } = useAuth();
  const {
    tasks, pagination, stats, loading, error,
    fetchTasks, fetchStats, createTask, updateTask, deleteTask,
  } = useTasks();

  const [modal, setModal] = useState({ open: false, task: null });
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadTasks = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    params.page = filters.page;
    params.limit = 9;
    fetchTasks(params);
  }, [filters, fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, tasks]);

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error]);

  const handleCreate = async (data) => {
    const result = await createTask(data);
    if (result.success) {
      setModal({ open: false, task: null });
      showToast(result.message);
      fetchStats();
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleUpdate = async (data) => {
    const result = await updateTask(modal.task._id, data);
    if (result.success) {
      setModal({ open: false, task: null });
      showToast(result.message);
      fetchStats();
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteTask(id);
    if (result.success) {
      showToast(result.message);
      setDeleteConfirm(null);
      fetchStats();
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    const result = await updateTask(id, { status });
    if (result.success) {
      showToast('Status updated');
      fetchStats();
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  };

  // Derive stats counts
  const totalTasks = pagination?.total || 0;
  const doneTasks = stats?.statusBreakdown?.find((s) => s._id === 'done')?.count || 0;
  const inProgressTasks = stats?.statusBreakdown?.find((s) => s._id === 'in-progress')?.count || 0;
  const highPriority = stats?.priorityBreakdown?.find((p) => p._id === 'high')?.count || 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {user?.role === 'admin'
                ? 'Viewing all tasks across all users'
                : `Welcome back, ${user?.name?.split(' ')[0]}`}
            </p>
          </div>
          <button
            onClick={() => setModal({ open: true, task: null })}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatCard
            label="Total Tasks"
            value={totalTasks}
            color="sky"
            icon={
              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="Completed"
            value={doneTasks}
            color="emerald"
            icon={
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="In Progress"
            value={inProgressTasks}
            color="amber"
            icon={
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="High Priority"
            value={highPriority}
            color="indigo"
            icon={
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input flex-1 text-sm py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input sm:w-36 text-sm py-2"
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="input sm:w-36 text-sm py-2"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {(filters.status || filters.priority || filters.search) && (
            <button
              onClick={() => setFilters({ status: '', priority: '', search: '', page: 1 })}
              className="btn-secondary text-sm py-2 shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Task Grid */}
        {loading && tasks.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 h-40 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-800 rounded w-full mb-2" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-1">No tasks found</p>
            <p className="text-slate-600 text-sm mb-6">
              {filters.search || filters.status || filters.priority
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            {!filters.search && !filters.status && !filters.priority && (
              <button
                onClick={() => setModal({ open: true, task: null })}
                className="btn-primary"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => setModal({ open: true, task: t })}
                  onDelete={(id) => setDeleteConfirm(id)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="btn-secondary px-3 py-2 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-slate-400 px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page >= pagination.pages}
                  className="btn-secondary px-3 py-2 disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Task Modal */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          loading={loading}
          onClose={() => setModal({ open: false, task: null })}
          onSubmit={modal.task ? handleUpdate : handleCreate}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative card p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Delete Task</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
