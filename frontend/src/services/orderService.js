import api from './api';

const orderService = {
  createOrder: (data) => api.post('/orders/create', data),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  buyAgain: (orderId) => api.post(`/orders/${orderId}/buy-again`),
  getShippingEstimate: (orderId) => api.get(`/orders/${orderId}/shipping-estimate`),
};

export default orderService;
