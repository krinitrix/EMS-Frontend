import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'ems_access_token';
const USER_KEY = 'ems_user';

let unauthorizedHandler = null;
let forbiddenHandler = null;

export const registerAuthHandlers = ({ onUnauthorized, onForbidden }) => {
  unauthorizedHandler = onUnauthorized;
  forbiddenHandler = onForbidden;
};

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (accessToken, user) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/api/users/login/');

    if (status === 401 && !isLoginRequest) {
      clearStoredAuth();
      if (unauthorizedHandler) {
        unauthorizedHandler('Your session has expired. Please log in again.');
      }
    } else if (status === 403 && !isLoginRequest) {
      if (forbiddenHandler) {
        forbiddenHandler('You do not have permission to perform this action.');
      }
    }

    return Promise.reject(error);
  }
);

export const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export const extractErrorMessage = (error, fallback = 'An unexpected error occurred.') => {
  if (!error.response) {
    return 'Unable to connect to the server. Please verify the backend is running.';
  }

  const data = error.response.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;

  if (typeof data === 'object') {
    const messages = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'object' && value !== null) {
        for (const [subKey, subVal] of Object.entries(value)) {
          const text = Array.isArray(subVal) ? subVal.join(', ') : String(subVal);
          messages.push(`${subKey}: ${text}`);
        }
      } else if (value !== null && value !== undefined) {
        messages.push(`${key}: ${String(value)}`);
      }
    }
    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }

  return fallback;
};

export default api;
