import api from './api';

export async function getBoards() {
  const response = await api.get('/boards');
  return response.data;
}

export async function createBoard(boardData) {
  const response = await api.post('/boards', boardData);
  return response.data;
}

export async function getBoard(boardId) {
  const response = await api.get(`/boards/${boardId}`);
  return response.data;
}

export async function moveTask(boardId, moveData) {
  const response = await api.post(`/boards/${boardId}/move-task`, moveData);
  return response.data;
}
