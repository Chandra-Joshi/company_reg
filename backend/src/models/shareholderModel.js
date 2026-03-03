// Shareholders table schema
const initShareholdersTable = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS shareholders (
            id SERIAL PRIMARY KEY,
            company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            nationality VARCHAR(100) NOT NULL
        );
    `);
};

export { initShareholdersTable };
