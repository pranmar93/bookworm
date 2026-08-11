import api from './api';

const paymentService = {
  initiate: (order_id, payment_method, card_last_four) =>
    api.post('/payments/initiate', { order_id, payment_method, card_last_four }),
  confirm: (payment_id, simulate_failure = false) =>
    api.post('/payments/confirm', { payment_id, simulate_failure }),
  getStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
  refund: (payment_id) => api.post('/payments/refund', { payment_id }),
};

export default paymentService;
