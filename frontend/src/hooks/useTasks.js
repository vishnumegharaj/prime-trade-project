import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/tasks', { params });
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/stats');
      setStats(data.data);
    } catch {
      // silently fail for stats
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/tasks', taskData);
      setTasks((prev) => [data.data, ...prev]);
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      const errors = err.response?.data?.errors || [];
      const fullMsg = errors.length ? errors.join(', ') : msg;
      setError(fullMsg);
      return { success: false, message: fullMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)));
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    pagination,
    stats,
    loading,
    error,
    clearError,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
  };
};
