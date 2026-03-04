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

// POST /api/companies/submit — create company + shareholders in one atomic call
const createCompanyWithShareholders = async (req, res) => {
    try {
        const { company, shareholders } = req.body;

        if (!company || !company.name || !company.num_shareholders || !company.total_capital) {
            return res.status(400).json({ error: 'Company name, number of shareholders, and total capital are required.' });
        }
        if (!Array.isArray(shareholders) || shareholders.length === 0) {
            return res.status(400).json({ error: 'At least one shareholder is required.' });
        }
        if (shareholders.length !== parseInt(company.num_shareholders)) {
            return res.status(400).json({ error: `Expected ${company.num_shareholders} shareholders, got ${shareholders.length}.` });
        }

        const result = await companyService.createCompanyWithShareholders(
            {
                name: company.name.trim(),
                num_shareholders: parseInt(company.num_shareholders),
                total_capital: parseFloat(company.total_capital),
            },
            shareholders
        );

        res.status(201).json(result);
    } catch (err) {
        console.error('Error creating company with shareholders:', err.message);
        res.status(500).json({ error: 'Failed to submit incorporation. Please try again.' });
    }
};

export { createCompany, getAllCompanies, getCompanyById, createCompanyWithShareholders };
