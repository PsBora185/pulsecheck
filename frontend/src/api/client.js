import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

let token = null;
let logoutCallback = null;

export const setAuthToken = (newToken) => {
  token = newToken;
};

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

client.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

client.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    if (logoutCallback) {
      logoutCallback();
    }
  }
  return Promise.reject(error);
});

export default client;
