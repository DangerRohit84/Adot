const pool = require('../config/database');

const Department = {
  findAll: async (collegeId) => {
    const result = await pool.query(
      'SELECT d.*, u.name as hod_name FROM departments d LEFT JOIN users u ON d.hod_id = u.id WHERE d.college_id = $1 AND d.is_active = true ORDER BY d.name',
      [collegeId]
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT d.*, u.name as hod_name FROM departments d LEFT JOIN users u ON d.hod_id = u.id WHERE d.id = $1',
      [id]
    );
    return result.rows[0];
  },

  create: async ({ name, code, college_id, hod_id }) => {
    const result = await pool.query(
      'INSERT INTO departments (name, code, college_id, hod_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code, college_id, hod_id]
    );
    return result.rows[0];
  },

  update: async (id, { name, code, hod_id }) => {
    const result = await pool.query(
      'UPDATE departments SET name = COALESCE($1, name), code = COALESCE($2, code), hod_id = COALESCE($3, hod_id) WHERE id = $4 RETURNING *',
      [name, code, hod_id, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE departments SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = Department;
