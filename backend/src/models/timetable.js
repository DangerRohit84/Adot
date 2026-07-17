const pool = require('../config/database');

const Timetable = {
  findAll: async (collegeId, filters = {}) => {
    let query = `SELECT t.*, sub.name as subject_name, sub.code as subject_code,
      u.name as teacher_name, sec.name as section_name
      FROM timetables t
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN users u ON t.teacher_id = u.id
      JOIN sections sec ON t.section_id = sec.id
      WHERE t.college_id = $1 AND t.is_active = true`;
    const params = [collegeId];

    if (filters.section_id) {
      params.push(filters.section_id);
      query += ` AND t.section_id = $${params.length}`;
    }
    if (filters.day) {
      params.push(filters.day);
      query += ` AND t.day_of_week = $${params.length}`;
    }
    if (filters.department_id) {
      params.push(filters.department_id);
      query += ` AND sec.department_id = $${params.length}`;
    }

    query += ' ORDER BY t.day_of_week, t.start_time';
    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await pool.query(
      `SELECT t.*, sub.name as subject_name, sub.code as subject_code,
        u.name as teacher_name, sec.name as section_name
       FROM timetables t
       JOIN subjects sub ON t.subject_id = sub.id
       JOIN users u ON t.teacher_id = u.id
       JOIN sections sec ON t.section_id = sec.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const result = await pool.query(
      `INSERT INTO timetables (section_id, subject_id, teacher_id, day_of_week, start_period, end_period, start_time, end_time, room_number, college_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        data.section_id, data.subject_id, data.teacher_id,
        data.day_of_week, data.start_period, data.end_period,
        data.start_time, data.end_time, data.room_number, data.college_id
      ]
    );
    return result.rows[0];
  },

  bulkCreate: async (entries, collegeId, sectionId) => {
    const client = await pool.connect();
    const results = { created: 0, errors: [] };

    try {
      await client.query('BEGIN');

      for (let i = 0; i < entries.length; i++) {
        try {
          const entry = entries[i];
          const year = entry.year ? parseInt(entry.year) : null;

          const subjectResult = await client.query(
            'SELECT s.id FROM subjects s JOIN departments d ON s.department_id = d.id WHERE s.code = $1 AND d.college_id = $2',
            [entry.subject_code, collegeId]
          );

          if (subjectResult.rows.length === 0) {
            results.errors.push({ row: i + 1, error: `Subject ${entry.subject_code} not found` });
            continue;
          }

          const teacherResult = await client.query(
            'SELECT id FROM users WHERE email = $1 AND college_id = $2',
            [entry.teacher_email, collegeId]
          );

          if (teacherResult.rows.length === 0) {
            results.errors.push({ row: i + 1, error: `Teacher ${entry.teacher_email} not found` });
            continue;
          }

          await client.query(
            `INSERT INTO timetables (section_id, subject_id, teacher_id, day_of_week, start_period, end_period, start_time, end_time, room_number, college_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              sectionId, subjectResult.rows[0].id, teacherResult.rows[0].id,
              entry.day, parseInt(entry.start_period), parseInt(entry.end_period),
              entry.start_time, entry.end_time, entry.room, collegeId
            ]
          );
          results.created++;
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

  delete: async (id) => {
    await pool.query('UPDATE timetables SET is_active = false WHERE id = $1', [id]);
  },
};

module.exports = Timetable;
