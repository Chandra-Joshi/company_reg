// Validate create company request body

import { pool } from "../data/database.js";

const validateCreateCompany = async (req, res, next) => {
    const { name, num_shareholders, total_capital } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Company name is required.' });
    }

    const trimmedName = name.trim();

    const nameRegex = /^[A-Za-z][A-Za-z0-9\s]*$/;

    if (!nameRegex.test(trimmedName)) {
        return res.status(400).json({
            error: 'Company name must start with a letter and contain only letters, numbers, and spaces.'
        });
    }

    if (!num_shareholders || num_shareholders < 1) {
        return res.status(400).json({ error: 'Number of shareholders must be at least 1.' });
    }

    if (!total_capital || total_capital <= 0) {
        return res.status(400).json({ error: 'Total capital must be greater than 0.' });
    }

    // Check for Duplicate Company Name using raw SQL query
    try {
        const result = await pool.query(
            'SELECT id FROM companies WHERE LOWER(name) = LOWER($1) LIMIT 1',
            [trimmedName]
        );
        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Company name already exists.' });
        }
    } catch (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: 'Server error while checking company name.' });
    }

    next();
};

export { validateCreateCompany };

