import api from './api';

export async function getTeamSummary() {
  const response = await api.get('/users/team/summary');
  return response.data;
}

export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function inviteUser(userData) {
  const response = await api.post('/users/invite', userData);
  return response.data;
}

export async function updateUser(userId, userData) {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
}

export async function getNotifications() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markNotificationRead(notificationId) {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function getFiles() {
  const response = await api.get('/files');
  return response.data;
}

export async function createFile(fileData) {
  const response = await api.post('/files', fileData);
  return response.data;
}

export async function deleteFile(fileId) {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
}

export async function getMessages() {
  const response = await api.get('/messages');
  return response.data;
}

export async function createMessage(messageData) {
  const response = await api.post('/messages', messageData);
  return response.data;
}

export async function getCalendarEvents() {
  const response = await api.get('/calendar');
  return response.data;
}

export async function createCalendarEvent(eventData) {
  const response = await api.post('/calendar', eventData);
  return response.data;
}

export async function getReports() {
  const response = await api.get('/reports');
  return response.data;
}

export async function createReport(reportData) {
  const response = await api.post('/reports', reportData);
  return response.data;
}

export async function globalSearch(q) {
  const response = await api.get('/search', { params: { q } });
  return response.data;
}
