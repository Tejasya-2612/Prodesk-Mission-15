import api from './api';

export async function getProjects(params = {}) {
  const response = await api.get('/projects', { params });
  return response.data;
}

export async function createProject(projectData) {
  const response = await api.post('/projects', projectData);
  return response.data;
}
