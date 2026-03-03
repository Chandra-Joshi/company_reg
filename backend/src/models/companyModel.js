// Companies table schema
const initCompaniesTable = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE,
            num_shareholders INTEGER NOT NULL,
            total_capital DECIMAL(15,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

export { initCompaniesTable };
