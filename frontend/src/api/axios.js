import axios from 'axios';


export const API_ORIGIN = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;