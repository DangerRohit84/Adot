const pool = require('../config/database');

const FloatingStudent = {
  findByDepartment: async (departmentId, collegeId) => {
    const result = await pool.query(
      `SELECT fs.*, s.name as student_name, s.roll_number,
              src.name as source_section_name, tgt.name as target_section_name,
              u.name as approved_by_name
       FROM floating_students fs
       JOIN students s ON fs.student_id = s.id
       JOIN sections src ON fs.source_section_id = src.id
       JOIN sections tgt ON fs.target_section_id = tgt.id
       LEFT JOIN users u ON fs.approved_by = u.id
       WHERE src.department_id = $1 AND s.college_id = $2 AND fs.is_active = true
       ORDER BY s.name`,
      [departmentId, collegeId]
    );
    return result.rows;
  },

  create: async (data) => {
    const result = await pool.query(
      `INSERT INTO floating_students (student_id, target_section_id, source_section_id, reason, approved_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.student_id, data.target_section_id, data.source_section_id, data.reason, data.approved_by]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('UPDATE floating_students SET is_active = false WHERE id = $1', [id]);
  },

  canFloat: async (studentId, targetSectionId) => {
    const result = await pool.query(
      'SELECT id FROM floating_students WHERE student_id = $1 AND target_section_id = $2 AND is_active = true',
      [studentId, targetSectionId]
    );
    return result.rows.length > 0;
  },

  recordFloatingAttendance: async (data) => {
    const result = await pool.query(
      `INSERT INTO floating_attendance (session_id, student_id, original_section_id, attended_section_id, status, scanned_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [data.session_id, data.student_id, data.original_section_id, data.attended_section_id, data.status]
    );
    return result.rows[0];
  },

  findByStudent: async (studentId) => {
    const result = await pool.query(
      `SELECT fs.*, tgt.name as target_section_name, src.name as source_section_name
       FROM floating_students fs
       JOIN sections tgt ON fs.target_section_id = tgt.id
       JOIN sections src ON fs.source_section_id = src.id
       WHERE fs.student_id = $1 AND fs.is_active = true`,
      [studentId]
    );
    return result.rows;
  },
};

module.exports = FloatingStudent;
