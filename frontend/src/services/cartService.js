import api from './api';

const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (book_id, quantity = 1) => api.post('/cart/items', { book_id, quantity }),
  updateItem: (cartItemId, quantity) => api.put(`/cart/items/${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
  clearCart: () => api.delete('/cart'),
};

export default cartService;
