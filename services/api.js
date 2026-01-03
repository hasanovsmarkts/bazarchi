import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';




const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
  getVendorProducts: () => api.get('/api/vendor/products'),
};

export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
};

export const ordersAPI = {
  create: (data) => api.post('/api/orders', data),
  getAll: () => api.get('/api/orders'),
  getVendorOrders: () => api.get('/api/vendor/orders'),
};

export const vendorAPI = {
  getStats: () => api.get('/api/vendor/stats'),
};

// export const paymentsAPI = {
//   createCheckoutSession: (data) => api.post('/api/checkout/session', data),
//   getCheckoutStatus: (sessionId) => api.get(`/api/checkout/status/${sessionId}`),
// };

export default api;
