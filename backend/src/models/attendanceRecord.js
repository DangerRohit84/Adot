const pool = require('../config/database');

const AttendanceRecord = {
  create: async ({ session_id, student_id, period_number, status, barcode_raw }) => {
    const result = await pool.query(
      `INSERT INTO attendance_records (session_id, student_id, period_number, status, scanned_at, barcode_raw)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       ON CONFLICT (session_id, student_id, period_number) DO UPDATE SET
         status = EXCLUDED.status, scanned_at = NOW()
       RETURNING *`,
      [session_id, student_id, period_number, status, barcode_raw]
    );
    return result.rows[0];
  },

  createMultiple: async (sessionId, studentId, startPeriod, endPeriod, status, barcodeRaw) => {
    const client = await pool.connect();
    const records = [];

    try {
      await client.query('BEGIN');

      for (let period = startPeriod; period <= endPeriod; period++) {
        const result = await client.query(
          `INSERT INTO attendance_records (session_id, student_id, period_number, status, scanned_at, barcode_raw)
           VALUES ($1, $2, $3, $4, NOW(), $5)
           ON CONFLICT (session_id, student_id, period_number) DO UPDATE SET
             status = EXCLUDED.status, scanned_at = NOW()
           RETURNING *`,
          [sessionId, studentId, period, status, barcodeRaw]
        );
        records.push(result.rows[0]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return records;
  },

  findBySession: async (sessionId) => {
    const result = await pool.query(
      `SELECT ar.*, st.roll_number, st.name as student_name, sec.name as section_name
       FROM attendance_records ar
       JOIN students st ON ar.student_id = st.id
       JOIN sections sec ON st.section_id = sec.id
       WHERE ar.session_id = $1
       ORDER BY st.roll_number, ar.period_number`,
      [sessionId]
    );
    return result.rows;
  },

  findExistingScan: async (sessionId, studentId) => {
    const result = await pool.query(
      'SELECT * FROM attendance_records WHERE session_id = $1 AND student_id = $2 LIMIT 1',
      [sessionId, studentId]
    );
    return result.rows[0];
  },

  markAllAbsent: async (sessionId, studentIds, startPeriod, endPeriod) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const studentId of studentIds) {
        for (let period = startPeriod; period <= endPeriod; period++) {
          await client.query(
            `INSERT INTO attendance_records (session_id, student_id, period_number, status)
             VALUES ($1, $2, $3, 'absent')
             ON CONFLICT (session_id, student_id, period_number) DO NOTHING`,
            [sessionId, studentId, period]
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getSessionSummary: async (sessionId) => {
    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT student_id) as total_students,
        COUNT(DISTINCT CASE WHEN status = 'present' THEN student_id END) as present,
        COUNT(DISTINCT CASE WHEN status = 'absent' THEN student_id END) as absent
       FROM attendance_records WHERE session_id = $1`,
      [sessionId]
    );
    return result.rows[0];
  },

  updateStatus: async (id, status) => {
    const result = await pool.query(
      'UPDATE attendance_records SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },
};

module.exports = AttendanceRecord;
