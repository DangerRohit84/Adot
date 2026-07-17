const pool = require('../config/database');

const College = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM colleges WHERE is_active = true ORDER BY name');
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async ({ name, code, address, created_by }) => {
    const result = await pool.query(
      'INSERT INTO colleges (name, code, address, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code, address, created_by]
    );
    return result.rows[0];
  },

  update: async (id, { name, code, address }) => {
    const result = await pool.query(
      'UPDATE colleges SET name = COALESCE($1, name), code = COALESCE($2, code), address = COALESCE($3, address) WHERE id = $4 RETURNING *',
      [name, code, address, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE colleges SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = College;
