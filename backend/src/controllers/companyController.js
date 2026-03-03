import * as companyService from '../services/companyService.js';

// POST request to create a new company
const createCompany = async (req, res) => {
    try {
        const { name, num_shareholders, total_capital } = req.body;

        const company = await companyService.createCompany(
            name.trim(),
            num_shareholders,
            total_capital
        );

        res.status(201).json(company);
    } catch (err) {
        console.error('Error creating company:', err.message);
        res.status(500).json({ error: 'Failed to create company.' });
    }
};

// GET request to Get all companies with nested
const getAllCompanies = async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();
        res.json(companies);
    } catch (err) {
        console.error('Error fetching companies:', err.message);
        res.status(500).json({ error: 'Failed to fetch companies.' });
    }
};

// GET request by id to Get a single company with shareholders
const getCompanyById = async (req, res) => {
    try {
        const company = await companyService.getCompanyById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found.' });
        }
        res.json(company);
    } catch (err) {
        console.error('Error fetching company:', err.message);
        res.status(500).json({ error: 'Failed to fetch company.' });
    }
};

export { createCompany, getAllCompanies, getCompanyById };
