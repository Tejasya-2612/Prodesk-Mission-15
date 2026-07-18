import api from './api';

export async function createCheckoutSession() {
  const response = await api.post('/create-checkout-session');
  return response.data;
}

