const pool = require('../config/database');
const { generateBarcodeData } = require('../utils/qr');

const Student = {
  findAll: async (collegeId, filters = {}) => {
    let query = 'SELECT st.*, sec.name as section_name, d.name as department_name FROM students st JOIN sections sec ON st.section_id = sec.id JOIN departments d ON sec.department_id = d.id WHERE st.college_id = $1 AND st.is_active = true';
    const params = [collegeId];

    if (filters.section_id) {
      params.push(filters.section_id);
      query += ` AND st.section_id = $${params.length}`;
    }
    if (filters.department_id) {
      params.push(filters.department_id);
      query += ` AND sec.department_id = $${params.length}`;
    }
    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (st.name ILIKE $${params.length} OR st.roll_number ILIKE $${params.length})`;
    }

    query += ' ORDER BY st.roll_number';
    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT st.*, sec.name as section_name, d.name as department_name FROM students st JOIN sections sec ON st.section_id = sec.id JOIN departments d ON sec.department_id = d.id WHERE st.id = $1',
      [id]
    );
    return result.rows[0];
  },

  findByBarcode: async (barcodeData) => {
    const result = await pool.query(
      'SELECT st.*, sec.name as section_name FROM students st JOIN sections sec ON st.section_id = sec.id WHERE st.barcode_data = $1 AND st.is_active = true',
      [barcodeData]
    );
    return result.rows[0];
  },

  findBySection: async (sectionId) => {
    const result = await pool.query(
      'SELECT * FROM students WHERE section_id = $1 AND is_active = true ORDER BY roll_number',
      [sectionId]
    );
    return result.rows;
  },

  findBySections: async (sectionIds) => {
    const result = await pool.query(
      'SELECT st.*, sec.name as section_name FROM students st JOIN sections sec ON st.section_id = sec.id WHERE st.section_id = ANY($1) AND st.is_active = true ORDER BY st.roll_number',
      [sectionIds]
    );
    return result.rows;
  },

  create: async ({ roll_number, name, section_id, college_id, email, phone }, collegeCode) => {
    const barcode_data = generateBarcodeData(roll_number, collegeCode);
    const result = await pool.query(
      'INSERT INTO students (roll_number, name, section_id, college_id, email, phone, barcode_data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [roll_number, name, section_id, college_id, email, phone, barcode_data]
    );
    return result.rows[0];
  },

  bulkCreate: async (students, collegeId, collegeCode) => {
    const client = await pool.connect();
    const results = { imported: 0, errors: [] };

    try {
      await client.query('BEGIN');

      for (let i = 0; i < students.length; i++) {
        try {
          const { roll_number, name, section, email, phone } = students[i];

          const sectionResult = await client.query(
            'SELECT s.id FROM sections s JOIN departments d ON s.department_id = d.id WHERE s.name = $1 AND d.college_id = $2',
            [section, collegeId]
          );

          if (sectionResult.rows.length === 0) {
            results.errors.push({ row: i + 1, error: `Section ${section} not found` });
            continue;
          }

          const barcode_data = generateBarcodeData(roll_number, collegeCode);
          await client.query(
            'INSERT INTO students (roll_number, name, section_id, college_id, email, phone, barcode_data) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [roll_number, name, sectionResult.rows[0].id, collegeId, email, phone, barcode_data]
          );
          results.imported++;
        } catch (err) {
          results.errors.push({ row: i + 1, error: err.message });
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return results;
  },

  update: async (id, { name, email, phone, section_id }) => {
    const result = await pool.query(
      'UPDATE students SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), section_id = COALESCE($4, section_id) WHERE id = $5 RETURNING *',
      [name, email, phone, section_id, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE students SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = Student;
