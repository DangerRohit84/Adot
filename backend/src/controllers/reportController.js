const pool = require('../config/database');
const { generateAttendanceExcel, generateCSV } = require('../utils/excel');

const getAttendanceReport = async (req, res) => {
  try {
    const { section_id, subject_id, start_date, end_date } = req.query;
    const collegeId = req.user.college_id;

    let query = `
      SELECT st.id as student_id, st.roll_number, st.name, sec.name as section,
        COUNT(DISTINCT asess.id) as total_classes,
        COUNT(DISTINCT CASE WHEN ar.status = 'present' THEN ar.id END) as present_count
      FROM students st
      JOIN sections sec ON st.section_id = sec.id
      JOIN departments d ON sec.department_id = d.id
      LEFT JOIN attendance_records ar ON ar.student_id = st.id
      LEFT JOIN attendance_sessions asess ON ar.session_id = asess.id
      LEFT JOIN timetables t ON asess.timetable_id = t.id
      WHERE d.college_id = $1 AND st.is_active = true
    `;
    const params = [collegeId];

    if (section_id) {
      params.push(section_id);
      query += ` AND st.section_id = $${params.length}`;
    }
    if (subject_id) {
      params.push(subject_id);
      query += ` AND t.subject_id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      query += ` AND asess.date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND asess.date <= $${params.length}`;
    }

    query += ` GROUP BY st.id, st.roll_number, st.name, sec.name ORDER BY st.roll_number`;

    const result = await pool.query(query, params);

    const report = result.rows.map(r => ({
      ...r,
      attendance_percentage: r.total_classes > 0
        ? ((r.present_count / r.total_classes) * 100).toFixed(1)
        : 0,
    }));

    res.json({ success: true, data: { section_id, subject_id, report } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportAttendance = async (req, res) => {
  try {
    const { section_id, subject_id, start_date, end_date, format = 'xlsx' } = req.query;
    const collegeId = req.user.college_id;

    // Get attendance data
    let query = `
      SELECT st.roll_number, st.name, sec.name as section,
        asess.date, t.day_of_week, t.start_period, t.end_period,
        sub.name as subject_name, ar.status, ar.period_number
      FROM students st
      JOIN sections sec ON st.section_id = sec.id
      JOIN departments d ON sec.department_id = d.id
      LEFT JOIN attendance_records ar ON ar.student_id = st.id
      LEFT JOIN attendance_sessions asess ON ar.session_id = asess.id
      LEFT JOIN timetables t ON asess.timetable_id = t.id
      LEFT JOIN subjects sub ON t.subject_id = sub.id
      WHERE d.college_id = $1 AND st.is_active = true
    `;
    const params = [collegeId];

    if (section_id) {
      params.push(section_id);
      query += ` AND st.section_id = $${params.length}`;
    }
    if (subject_id) {
      params.push(subject_id);
      query += ` AND t.subject_id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      query += ` AND asess.date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND asess.date <= $${params.length}`;
    }

    query += ' ORDER BY st.roll_number, ar.period_number';

    const result = await pool.query(query, params);

    // Transform data for export
    const periods = [...new Set(result.rows.map(r => r.period_number))].sort();
    const studentMap = {};

    result.rows.forEach(r => {
      if (!studentMap[r.roll_number]) {
        studentMap[r.roll_number] = {
          roll_number: r.roll_number,
          name: r.name,
          section: r.section,
          periods: {},
        };
      }
      if (r.period_number) {
        studentMap[r.roll_number].periods[r.period_number] = r.status;
      }
    });

    const exportData = {
      periods,
      students: Object.values(studentMap),
    };

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
      return res.send(csv);
    }

    const workbook = await generateAttendanceExcel(exportData);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAttendanceReport, exportAttendance };
