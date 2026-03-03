import * as companyService from '../services/companyService.js';

// Validate add shareholders request body
const validateAddShareholders = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { shareholders } = req.body;

        // Validate company exists
        const company = await companyService.getCompanyById(id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found.' });
        }

        // Validate shareholders array
        if (!Array.isArray(shareholders) || shareholders.length === 0) {
            return res.status(400).json({ error: 'Shareholders array is required.' });
        }

        if (shareholders.length !== company.num_shareholders) {
            return res.status(400).json({
                error: `Expected ${company.num_shareholders} shareholders, but received ${shareholders.length}.`,
            });
        }

        // Validate each shareholder
        for (let i = 0; i < shareholders.length; i++) {
            const s = shareholders[i];
            if (!s.first_name || !s.first_name.trim()) {
                return res.status(400).json({ error: `Shareholder ${i + 1}: First name is required.` });
            }
            if (!s.last_name || !s.last_name.trim()) {
                return res.status(400).json({ error: `Shareholder ${i + 1}: Last name is required.` });
            }
            if (!s.nationality || !s.nationality.trim()) {
                return res.status(400).json({ error: `Shareholder ${i + 1}: Nationality is required.` });
            }
        }

        // Attach company to request so controller doesn't need to fetch it again
        req.company = company;
        next();
    } catch (err) {
        console.error('Validation error:', err.message);
        res.status(500).json({ error: 'Validation failed.' });
    }
};

export { validateAddShareholders };
