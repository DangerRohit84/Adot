const pool = require('../config/database');

const AttendanceSession = {
  create: async ({ timetable_id, date, scanned_by, college_id }) => {
    const result = await pool.query(
      'INSERT INTO attendance_sessions (timetable_id, date, scanned_by, college_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [timetable_id, date || new Date().toISOString().split('T')[0], scanned_by, college_id]
    );
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query(
      `SELECT asess.*, t.day_of_week, t.start_period, t.end_period, t.combined_group_id,
        sub.name as subject_name, sub.code as subject_code,
        sec.name as section_name, u.name as scanner_name
       FROM attendance_sessions asess
       JOIN timetables t ON asess.timetable_id = t.id
       JOIN subjects sub ON t.subject_id = sub.id
       JOIN sections sec ON t.section_id = sec.id
       JOIN users u ON asess.scanned_by = u.id
       WHERE asess.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  findActive: async (timetableId, date) => {
    const result = await pool.query(
      'SELECT * FROM attendance_sessions WHERE timetable_id = $1 AND date = $2 AND is_active = true',
      [timetableId, date || new Date().toISOString().split('T')[0]]
    );
    return result.rows[0];
  },

  endSession: async (id) => {
    const result = await pool.query(
      'UPDATE attendance_sessions SET is_active = false, ended_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  findByCollege: async (collegeId, filters = {}) => {
    let query = `SELECT asess.*, t.day_of_week, t.start_period, t.end_period,
      sub.name as subject_name, sec.name as section_name, u.name as scanner_name
      FROM attendance_sessions asess
      JOIN timetables t ON asess.timetable_id = t.id
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN sections sec ON t.section_id = sec.id
      JOIN users u ON asess.scanned_by = u.id
      WHERE asess.college_id = $1`;
    const params = [collegeId];

    if (filters.section_id) {
      params.push(filters.section_id);
      query += ` AND t.section_id = $${params.length}`;
    }
    if (filters.department_id) {
      params.push(filters.department_id);
      query += ` AND sec.department_id = $${params.length}`;
    }
    if (filters.date) {
      params.push(filters.date);
      query += ` AND asess.date = $${params.length}`;
    }

    query += ' ORDER BY asess.started_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },
};

module.exports = AttendanceSession;
