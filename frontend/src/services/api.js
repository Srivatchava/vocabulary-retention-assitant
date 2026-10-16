import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5099/api',
});
// Automatically attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default api;