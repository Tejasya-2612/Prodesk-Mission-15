import api from './api';

export async function getTasks(params = {}) {
  const response = await api.get('/tasks', { params });
  return response.data;
}

export async function createTask(taskData) {
  const response = await api.post('/tasks', taskData);
  return response.data;
}

export async function updateTask(taskId, taskData) {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}
