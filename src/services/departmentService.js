import api, { extractList } from './api';

const departmentService = {
  getAll: async () => {
    const response = await api.get('/api/employee/v1/departments/');
    return extractList(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/api/employee/v1/departments/${id}/`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post('/api/employee/v1/departments/', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/api/employee/v1/departments/${id}/`, payload);
    return response.data;
  },

  partialUpdate: async (id, payload) => {
    const response = await api.patch(`/api/employee/v1/departments/${id}/`, payload);
    return response.data;
  },

  remove: async (id) => {
    await api.delete(`/api/employee/v1/departments/${id}/`);
  },
};

export default departmentService;
