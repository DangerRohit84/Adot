const pool = require('../config/database');

const Section = {
  findAll: async (collegeId, filters = {}) => {
    let query = 'SELECT s.*, d.name as department_name FROM sections s JOIN departments d ON s.department_id = d.id WHERE d.college_id = $1 AND s.is_active = true';
    const params = [collegeId];

    if (filters.department_id) {
      params.push(filters.department_id);
      query += ` AND s.department_id = $${params.length}`;
    }
    if (filters.year) {
      params.push(filters.year);
      query += ` AND s.year = $${params.length}`;
    }
    if (filters.semester) {
      params.push(filters.semester);
      query += ` AND s.semester = $${params.length}`;
    }

    query += ' ORDER BY s.name';
    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT s.*, d.name as department_name, (SELECT COUNT(*) FROM students st WHERE st.section_id = s.id AND st.is_active = true) as student_count FROM sections s JOIN departments d ON s.department_id = d.id WHERE s.id = $1',
      [id]
    );
    return result.rows[0];
  },

  findByName: async (name, collegeId) => {
    const result = await pool.query(
      'SELECT s.* FROM sections s JOIN departments d ON s.department_id = d.id WHERE s.name = $1 AND d.college_id = $2',
      [name, collegeId]
    );
    return result.rows[0];
  },

  create: async ({ name, department_id, year, semester }) => {
    const result = await pool.query(
      'INSERT INTO sections (name, department_id, year, semester) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, department_id, year, semester]
    );
    return result.rows[0];
  },

  update: async (id, { name, year, semester }) => {
    const result = await pool.query(
      'UPDATE sections SET name = COALESCE($1, name), year = COALESCE($2, year), semester = COALESCE($3, semester) WHERE id = $4 RETURNING *',
      [name, year, semester, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE sections SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = Section;
