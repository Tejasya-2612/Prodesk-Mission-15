import api from './api';

export async function getDashboardStats() {
  const response = await api.get('/dashboard/stats');
  return response.data;
}

export async function getDashboardCharts() {
  const response = await api.get('/dashboard/charts');
  return response.data;
}

export async function getUpcomingDeadlines() {
  const response = await api.get('/dashboard/deadlines');
  return response.data;
}

export async function getDashboardActivity() {
  const response = await api.get('/dashboard/activity');
  return response.data;
}
