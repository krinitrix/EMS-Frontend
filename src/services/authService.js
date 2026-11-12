import api from './api';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/users/login/', {
      username,
      password,
    });
    return response.data;
  },
};

export default authService;
