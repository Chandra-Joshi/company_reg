import { pool } from '../data/database.js';

// Add shareholders to a company (transactional)
const addShareholders = async (companyId, shareholders) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete existing shareholders (in case of re-submission)
        await client.query('DELETE FROM shareholders WHERE company_id = $1', [companyId]);

        // Insert all shareholders
        for (const s of shareholders) {
            await client.query(
                `INSERT INTO shareholders (company_id, first_name, last_name, nationality)
         VALUES ($1, $2, $3, $4)`,
                [companyId, s.first_name.trim(), s.last_name.trim(), s.nationality.trim()]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export { addShareholders };
