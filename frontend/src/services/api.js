const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: getHeaders(),
    ...(body && { body: JSON.stringify(body) })
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    const apiError = new Error(error.message || error.error || 'API Error');
    apiError.status = response.status;
    throw apiError;
  }
  
  // For 204 No Content
  if (response.status === 204) return null;
  
  return response.json();
};

export const authApi = {
  login: (data) => apiCall('/auth/login', 'POST', data),
  signup: (data) => apiCall('/auth/signup', 'POST', data),
};

export const productsApi = {
  getAll: () => apiCall('/products'),
  create: (data) => apiCall('/products', 'POST', data),
  update: (id, data) => apiCall(`/products/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/products/${id}`, 'DELETE'),
};

export const receiptsApi = {
  getAll: () => apiCall('/receipts'),
  getById: (id) => apiCall(`/receipts/${id}`),
  create: (data) => apiCall('/receipts', 'POST', data),
  validate: (id) => apiCall(`/receipts/${id}/validate`, 'PUT'),
};

export const deliveriesApi = {
  getAll: () => apiCall('/deliveries'),
  getById: (id) => apiCall(`/deliveries/${id}`),
  create: (data) => apiCall('/deliveries', 'POST', data),
  validate: (id) => apiCall(`/deliveries/${id}/validate`, 'PUT'),
};

export const stockApi = {
  getAll: () => apiCall('/stock'),
  getMoves: () => apiCall('/stock/moves'),
  update: (data) => apiCall('/stock/update', 'PUT', data),
  transfer: (data) => apiCall('/stock/transfer', 'POST', data),
};

export const warehouseApi = {
  getAll: () => apiCall('/warehouses'),
  create: (data) => apiCall('/warehouses', 'POST', data),
};

export const locationApi = {
  getAll: () => apiCall('/locations'),
  create: (data) => apiCall('/locations', 'POST', data),
};
