const pool = require('../config/database');

const Subject = {
  findAll: async (collegeId, filters = {}) => {
    let query = 'SELECT sub.*, d.name as department_name FROM subjects sub JOIN departments d ON sub.department_id = d.id WHERE d.college_id = $1 AND sub.is_active = true';
    const params = [collegeId];

    if (filters.department_id) {
      params.push(filters.department_id);
      query += ` AND sub.department_id = $${params.length}`;
    }

    query += ' ORDER BY sub.name';
    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
    return result.rows[0];
  },

  findByCode: async (code, departmentId) => {
    const result = await pool.query(
      'SELECT * FROM subjects WHERE code = $1 AND department_id = $2',
      [code, departmentId]
    );
    return result.rows[0];
  },

  create: async ({ name, code, department_id }) => {
    const result = await pool.query(
      'INSERT INTO subjects (name, code, department_id) VALUES ($1, $2, $3) RETURNING *',
      [name, code, department_id]
    );
    return result.rows[0];
  },

  update: async (id, { name, code }) => {
    const result = await pool.query(
      'UPDATE subjects SET name = COALESCE($1, name), code = COALESCE($2, code) WHERE id = $3 RETURNING *',
      [name, code, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE subjects SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = Subject;
