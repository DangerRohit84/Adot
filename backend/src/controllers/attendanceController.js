const AttendanceSession = require('../models/attendanceSession');
const AttendanceRecord = require('../models/attendanceRecord');
const Timetable = require('../models/timetable');
const Student = require('../models/student');
const FloatingStudent = require('../models/floatingStudent');
const { emitToCollege } = require('../utils/socket');

const getSessions = async (req, res) => {
  try {
    const collegeId = req.user.college_id;
    const sessions = await AttendanceSession.findByCollege(collegeId, req.query);
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const startSession = async (req, res) => {
  try {
    const { timetable_id, date } = req.body;
    if (!timetable_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'timetable_id is required' });
    }

    // Check if session already exists
    const existing = await AttendanceSession.findActive(timetable_id, date);
    if (existing) {
      const students = await getStudentsForSession(existing);
      return res.json({ success: true, data: { session: existing, students, total_students: students.length } });
    }

    const session = await AttendanceSession.create({
      timetable_id,
      date,
      scanned_by: req.user.id,
      college_id: req.user.college_id,
    });

    const students = await getStudentsForSession(session);

    res.status(201).json({
      success: true,
      data: {
        session,
        students: students.map(s => ({
          id: s.id,
          roll_number: s.roll_number,
          name: s.name,
          barcode_data: s.barcode_data,
          section: s.section_name,
        })),
        total_students: students.length,
        periods_covered: getPeriodsCovered(session),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudentsForSession = async (session) => {
  const timetable = await Timetable.findById(session.timetable_id);
  const sectionId = timetable.section_id;

  if (timetable.combined_group_id) {
    const combined = await Timetable.findCombinedGroup(
      timetable.combined_group_id,
      timetable.day_of_week,
      timetable.start_period
    );
    const sectionIds = combined.map(c => c.section_id);
    const students = await Student.findBySections(sectionIds);
    // Also include floating students from other sections targeting these sections
    const floatingStudents = await Student.findFloatingToSections(sectionIds);
    return [...students, ...floatingStudents.filter(fs => !students.find(s => s.id === fs.id))];
  }

  const students = await Student.findBySection(sectionId);
  // Include floating students from other sections targeting this section
  const floatingStudents = await Student.findFloatingToSections([sectionId]);
  return [...students, ...floatingStudents.filter(fs => !students.find(s => s.id === fs.id))];
};

const getPeriodsCovered = (session) => {
  // This will be populated when we get the timetable details
  return [1]; // Placeholder
};

const scanStudent = async (req, res) => {
  try {
    const { session_id, barcode_data } = req.body;
    if (!session_id || !barcode_data) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'session_id and barcode_data are required' });
    }

    // Get session details
    const session = await AttendanceSession.findById(session_id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Session not found' });
    }
    if (!session.is_active) {
      return res.status(400).json({ success: false, error: 'SESSION_ENDED', message: 'Session has ended' });
    }

    // Find student by barcode
    const student = await Student.findByBarcode(barcode_data);
    if (!student) {
      return res.status(404).json({ success: false, error: 'INVALID_QR', message: 'Invalid QR code' });
    }

    // Check if already scanned
    const existing = await AttendanceRecord.findExistingScan(session_id, student.id);
    if (existing) {
      return res.json({
        success: false,
        error: 'ALREADY_MARKED',
        message: 'Already marked present',
        data: {
          student: { name: student.name, roll_number: student.roll_number },
        }
      });
    }

    // Get timetable for period range
    const timetable = await Timetable.findById(session.timetable_id);

    // Validate student belongs to this section (or is floating to it)
    let isFloating = false;
    if (student.section_id !== timetable.section_id) {
      const allowed = await FloatingStudent.canFloat(student.id, timetable.section_id);
      if (!allowed) {
        return res.status(400).json({
          success: false,
          error: 'WRONG_SECTION',
          message: `Student belongs to ${student.section_name}, not this class`,
        });
      }
      isFloating = true;
    }

    // Create attendance records for all periods
    const records = await AttendanceRecord.createMultiple(
      session_id,
      student.id,
      timetable.start_period,
      timetable.end_period,
      'present',
      barcode_data
    );

    // Emit real-time event
    emitToCollege(req.user.college_id, 'student-scanned', {
      session_id,
      student: {
        id: student.id,
        roll_number: student.roll_number,
        name: student.name,
        section: student.section_name,
      },
      status: 'present',
      periods_marked: records.map(r => r.period_number),
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          roll_number: student.roll_number,
          name: student.name,
          section: student.section_name,
        },
        status: 'present',
        is_floating: isFloating,
        periods_marked: records.map(r => r.period_number),
        message: isFloating
          ? `Floating student marked present for periods ${timetable.start_period}-${timetable.end_period}`
          : `Marked present for periods ${timetable.start_period}-${timetable.end_period}`,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Session not found' });
    }

    // Get all students for this session
    const students = await getStudentsForSession(session);

    // Get timetable for period range
    const timetable = await Timetable.findById(session.timetable_id);

    // Get already marked student IDs
    const existingRecords = await AttendanceRecord.findBySession(sessionId);
    const markedStudentIds = [...new Set(existingRecords.map(r => r.student_id))];

    // Find unmarked students
    const unmarkedStudentIds = students
      .filter(s => !markedStudentIds.includes(s.id))
      .map(s => s.id);

    // Mark unmarked students as absent
    if (unmarkedStudentIds.length > 0) {
      await AttendanceRecord.markAllAbsent(
        sessionId,
        unmarkedStudentIds,
        timetable.start_period,
        timetable.end_period
      );
    }

    // End the session
    await AttendanceSession.endSession(sessionId);

    // Get summary
    const summary = await AttendanceRecord.getSessionSummary(sessionId);

    // Emit real-time event
    emitToCollege(req.user.college_id, 'session-ended', {
      session_id: sessionId,
      summary: {
        total: students.length,
        present: summary.present,
        absent: summary.absent,
      }
    });

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        total_students: students.length,
        present: summary.present,
        absent: summary.absent,
        marked_at: new Date().toISOString(),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const manualMark = async (req, res) => {
  try {
    const { session_id, student_id, status } = req.body;
    if (!session_id || !student_id || !status) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'session_id, student_id, and status are required' });
    }

    const session = await AttendanceSession.findById(session_id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Session not found' });
    }

    const timetable = await Timetable.findById(session.timetable_id);
    const records = await AttendanceRecord.createMultiple(
      session_id, student_id,
      timetable.start_period, timetable.end_period,
      status, 'manual'
    );

    res.json({ success: true, data: { records, message: `Manually marked as ${status}` } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSessionRecords = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Session not found' });
    }

    const records = await AttendanceRecord.findBySession(req.params.sessionId);
    const summary = await AttendanceRecord.getSessionSummary(req.params.sessionId);

    // Group records by student
    const studentMap = {};
    records.forEach(r => {
      if (!studentMap[r.student_id]) {
        studentMap[r.student_id] = {
          student_id: r.student_id,
          roll_number: r.roll_number,
          name: r.student_name,
          section: r.section_name,
          periods: {},
        };
      }
      studentMap[r.student_id].periods[r.period_number] = r.status;
    });

    res.json({
      success: true,
      data: {
        session,
        records: Object.values(studentMap),
        summary,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getSessions, startSession, scanStudent, endSession, manualMark, getSessionRecords };
