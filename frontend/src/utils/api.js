import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) || 'http://localhost:5000/api';

const API = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Submit company + shareholders atomically in one call (new single-submit flow)
export const submitIncorporation = (data) => API.post('/companies/submit', data);

// Get all companies (used by Admin page)
export const getCompanies = () => API.get('/companies');

// Get a single company by ID
export const getCompany = (id) => API.get(`/companies/${id}`);

export default API;
