import axios from 'axios';

// In development, VITE_API_URL is not set so baseURL is '' and Vite's
// dev proxy forwards /api/* → http://localhost:5000.
// In production (Vercel), VITE_API_URL is set to the Render backend URL.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  timeout: 15000,
});

export default axiosInstance;
