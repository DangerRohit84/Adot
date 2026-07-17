const pool = require('../config/database');
const bcrypt = require('bcrypt');

const User = {
  findAll: async (collegeId, filters = {}) => {
    let query = 'SELECT id, name, email, phone, role, college_id, department_id, section_id, is_active, created_at FROM users WHERE college_id = $1 AND is_active = true';
    const params = [collegeId];

    if (filters.role) {
      params.push(filters.role);
      query += ` AND role = $${params.length}`;
    }
    if (filters.department_id) {
      params.push(filters.department_id);
      query += ` AND department_id = $${params.length}`;
    }

    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, college_id, department_id, section_id, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  create: async ({ name, email, phone, password, role, college_id, department_id, section_id }) => {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role, college_id, department_id, section_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, phone, role, college_id, department_id, section_id, created_at',
      [name, email, phone, password_hash, role, college_id, department_id, section_id]
    );
    return result.rows[0];
  },

  update: async (id, { name, email, phone, role, department_id, section_id }) => {
    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), role = COALESCE($4, role), department_id = COALESCE($5, department_id), section_id = COALESCE($6, section_id) WHERE id = $7 RETURNING id, name, email, phone, role, college_id, department_id, section_id',
      [name, email, phone, role, department_id, section_id, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = User;
