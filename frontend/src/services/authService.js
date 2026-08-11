import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  guestLogin: () => api.post('/auth/guest-login'),
  verify: () => api.get('/auth/verify'),
};

export default authService;
