const FloatingStudent = require('../models/floatingStudent');

const getFloatingStudents = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const collegeId = req.user.college_id;
    const students = await FloatingStudent.findByDepartment(departmentId, collegeId);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addFloatingStudent = async (req, res) => {
  try {
    const { student_id, target_section_id, source_section_id, reason } = req.body;
    if (!student_id || !target_section_id || !source_section_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'student_id, target_section_id, source_section_id are required' });
    }
    const existing = await FloatingStudent.canFloat(student_id, target_section_id);
    if (existing) {
      return res.status(409).json({ success: false, error: 'DUPLICATE', message: 'Student already floating to this section' });
    }
    const result = await FloatingStudent.create({
      student_id, target_section_id, source_section_id, reason, approved_by: req.user.id
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeFloatingStudent = async (req, res) => {
  try {
    await FloatingStudent.delete(req.params.id);
    res.json({ success: true, message: 'Floating assignment removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudentFloats = async (req, res) => {
  try {
    const floats = await FloatingStudent.findByStudent(req.params.studentId);
    res.json({ success: true, data: floats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getFloatingStudents, addFloatingStudent, removeFloatingStudent, getStudentFloats };
