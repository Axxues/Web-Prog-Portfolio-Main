import axios from 'axios';


export const API_ORIGIN = 'https://web-prog-portfolio-main-api.onrender.com';

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