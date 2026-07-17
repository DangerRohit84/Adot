const pool = require('../config/database');

const StudentTeacherSelection = {
  findByDepartment: async (departmentId, collegeId) => {
    const result = await pool.query(
      `SELECT sts.*, s.name as student_name, s.roll_number,
              sub.name as subject_name, sub.code as subject_code,
              u.name as teacher_name, sec.name as section_name
       FROM student_teacher_selections sts
       JOIN students s ON sts.student_id = s.id
       JOIN subjects sub ON sts.subject_id = sub.id
       JOIN users u ON sts.teacher_id = u.id
       JOIN sections sec ON sts.section_id = sec.id
       WHERE sts.section_id IN (SELECT id FROM sections WHERE department_id = $1)
       AND sts.college_id = $2
       ORDER BY sub.name, s.roll_number`,
      [departmentId, collegeId]
    );
    return result.rows;
  },

  findByStudent: async (studentId) => {
    const result = await pool.query(
      `SELECT sts.*, sub.name as subject_name, u.name as teacher_name
       FROM student_teacher_selections sts
       JOIN subjects sub ON sts.subject_id = sub.id
       JOIN users u ON sts.teacher_id = u.id
       WHERE sts.student_id = $1`,
      [studentId]
    );
    return result.rows;
  },

  findByTeacherAndSubject: async (teacherId, subjectId) => {
    const result = await pool.query(
      `SELECT sts.*, s.name as student_name, s.roll_number, sec.name as section_name
       FROM student_teacher_selections sts
       JOIN students s ON sts.student_id = s.id
       JOIN sections sec ON sts.section_id = sec.id
       WHERE sts.teacher_id = $1 AND sts.subject_id = $2`,
      [teacherId, subjectId]
    );
    return result.rows;
  },

  findAllocation: async (studentId, teacherId, subjectId) => {
    const result = await pool.query(
      'SELECT id FROM student_teacher_selections WHERE student_id = $1 AND teacher_id = $2 AND subject_id = $3',
      [studentId, teacherId, subjectId]
    );
    return result.rows[0];
  },

  bulkCreate: async (selections, collegeId) => {
    const client = await pool.connect();
    const results = { created: 0, errors: [] };

    try {
      await client.query('BEGIN');

      for (let i = 0; i < selections.length; i++) {
        try {
          const { student_id, subject_id, teacher_id, section_id } = selections[i];
          await client.query(
            `INSERT INTO student_teacher_selections (student_id, subject_id, teacher_id, section_id, college_id)
             VALUES ($1, $2, $3, $4, $5) ON CONFLICT (student_id, subject_id) DO UPDATE SET teacher_id = $3`,
            [student_id, subject_id, teacher_id, section_id, collegeId]
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

  create: async (data) => {
    const result = await pool.query(
      `INSERT INTO student_teacher_selections (student_id, subject_id, teacher_id, section_id, college_id)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (student_id, subject_id) DO UPDATE SET teacher_id = $3, teacher_id = $3 RETURNING *`,
      [data.student_id, data.subject_id, data.teacher_id, data.section_id, data.college_id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query('DELETE FROM student_teacher_selections WHERE id = $1', [id]);
  },

  deleteByFilters: async (filters) => {
    if (filters.student_id) {
      await pool.query('DELETE FROM student_teacher_selections WHERE student_id = $1', [filters.student_id]);
    } else if (filters.section_id && filters.subject_id) {
      await pool.query(
        'DELETE FROM student_teacher_selections WHERE section_id = $1 AND subject_id = $2',
        [filters.section_id, filters.subject_id]
      );
    }
  },
};

module.exports = StudentTeacherSelection;
