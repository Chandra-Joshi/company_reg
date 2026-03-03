import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create a new company (Step 1)
export const createCompany = (data) => API.post('/companies', data);

// Add shareholders to a company (Step 2)
export const addShareholders = (companyId, shareholders) =>
    API.post(`/companies/${companyId}/shareholders`, { shareholders });

// Get all companies
export const getCompanies = () => API.get('/companies');

// Get a single company by ID
export const getCompany = (id) => API.get(`/companies/${id}`);

export default API;
