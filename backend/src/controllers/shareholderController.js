import * as shareholderService from '../services/shareholderService.js';

// POST request to add shareholders to a company
const addShareholders = async (req, res) => {
    try {
        const { id } = req.params;
        const { shareholders } = req.body;

        await shareholderService.addShareholders(id, shareholders);
        res.status(201).json({ message: 'Shareholders added successfully.' });
    } catch (err) {
        console.error('Error adding shareholders:', err.message);
        res.status(500).json({ error: 'Failed to add shareholders.' });
    }
};

export { addShareholders };
