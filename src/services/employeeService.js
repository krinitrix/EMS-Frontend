import api, { extractList } from './api';

const employeeService = {
  getAll: async () => {
    const response = await api.get('/api/employee/v1/records/');
    return extractList(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/api/employee/v1/records/${id}/`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post('/api/employee/v1/records/', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/api/employee/v1/records/${id}/`, payload);
    return response.data;
  },

  partialUpdate: async (id, payload) => {
    const response = await api.patch(`/api/employee/v1/records/${id}/`, payload);
    return response.data;
  },

  remove: async (id) => {
    await api.delete(`/api/employee/v1/records/${id}/`);
  },

  getMe: async () => {
    const response = await api.get('/api/employee/v1/me/');
    return response.data;
  },
};

export default employeeService;
