import pg from 'pg';
import dotenv from 'dotenv';
import { initCompaniesTable } from '../models/companyModel.js';
import { initShareholdersTable } from '../models/shareholderModel.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database tables by calling each model's init function
const initDB = async () => {
    try {
        await initCompaniesTable(pool);
        await initShareholdersTable(pool);

        console.log('Database tables initialized successfully.');
    } catch (err) {
        console.error('Failed to initialize database tables:', err.message);
        process.exit(1);
    }
};

export { pool, initDB };
