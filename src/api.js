// src/api.js
import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://192.168.18.36:5050/api/v1',
  baseURL: 'https://campus-check-server.onrender.com/api/v1',
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;
