import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getOrderHistory: (params = {}) => api.get('/users/order-history', { params }),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (book_id) => api.post('/users/wishlist', { book_id }),
  removeFromWishlist: (bookId) => api.delete(`/users/wishlist/${bookId}`),
  getGiftPoints: () => api.get('/users/gift-points'),
  getAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (addressId, data) => api.put(`/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/addresses/${addressId}`),
  setDefaultAddress: (addressId) => api.put(`/addresses/${addressId}/set-default`),
  submitReview: (data) => api.post('/reviews', data),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default userService;
