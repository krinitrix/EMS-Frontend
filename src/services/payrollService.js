import api, { extractList } from './api';

const payrollService = {
  getAll: async () => {
    const response = await api.get('/api/payroll/v1/records/');
    return extractList(response.data);
  },

  create: async (payload) => {
    const response = await api.post('/api/payroll/v1/records/', payload);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/payroll/v1/me/');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data ? [response.data] : [];
  },
};

export default payrollService;
