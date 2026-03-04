import { pool } from '../data/database.js';

// Create a new company
const createCompany = async (name, num_shareholders, total_capital) => {
  const result = await pool.query(
    `INSERT INTO companies (name, num_shareholders, total_capital)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, num_shareholders, total_capital]
  );
  return result.rows[0];
};

// Get all companies with nested shareholders
const getAllCompanies = async () => {
  const result = await pool.query(`
    SELECT 
      c.id, c.name, c.num_shareholders, c.total_capital, c.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'first_name', s.first_name,
            'last_name', s.last_name,
            'nationality', s.nationality
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS shareholders
    FROM companies c
    LEFT JOIN shareholders s ON c.id = s.company_id
    GROUP BY c.id, c.name, c.num_shareholders, c.total_capital, c.created_at
    ORDER BY c.created_at DESC
  `);
  return result.rows;
};

// Get a single company by ID with shareholders
const getCompanyById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      c.id, c.name, c.num_shareholders, c.total_capital, c.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'first_name', s.first_name,
            'last_name', s.last_name,
            'nationality', s.nationality
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS shareholders
    FROM companies c
    LEFT JOIN shareholders s ON c.id = s.company_id
    WHERE c.id = $1
    GROUP BY c.id, c.name, c.num_shareholders, c.total_capital, c.created_at
    `,
    [id]
  );
  return result.rows[0] || null;
};

// Atomically create a company and its shareholders in one transaction
const createCompanyWithShareholders = async (company, shareholders) => {
  const { name, num_shareholders, total_capital } = company;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const companyResult = await client.query(
      `INSERT INTO companies (name, num_shareholders, total_capital)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, num_shareholders, total_capital]
    );
    const newCompany = companyResult.rows[0];

    for (const s of shareholders) {
      await client.query(
        `INSERT INTO shareholders (company_id, first_name, last_name, nationality)
         VALUES ($1, $2, $3, $4)`,
        [newCompany.id, s.first_name.trim(), s.last_name.trim(), s.nationality.trim()]
      );
    }

    await client.query('COMMIT');
    return { ...newCompany, shareholders };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export { createCompany, getAllCompanies, getCompanyById, createCompanyWithShareholders };
