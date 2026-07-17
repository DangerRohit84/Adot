const StudentTeacherSelection = require('../models/studentTeacherSelection');

const getSelections = async (req, res) => {
  try {
    const selections = await StudentTeacherSelection.findByDepartment(req.user.department_id, req.user.college_id);
    res.json({ success: true, data: selections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudentSelections = async (req, res) => {
  try {
    const selections = await StudentTeacherSelection.findByStudent(req.params.studentId);
    res.json({ success: true, data: selections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSelection = async (req, res) => {
  try {
    const { student_id, subject_id, teacher_id, section_id } = req.body;
    if (!student_id || !subject_id || !teacher_id || !section_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'student_id, subject_id, teacher_id, section_id are required' });
    }
    const result = await StudentTeacherSelection.create({
      student_id, subject_id, teacher_id, section_id, college_id: req.user.college_id
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const bulkCreateSelections = async (req, res) => {
  try {
    const { selections } = req.body;
    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'selections array is required' });
    }
    const result = await StudentTeacherSelection.bulkCreate(selections, req.user.college_id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteSelection = async (req, res) => {
  try {
    await StudentTeacherSelection.delete(req.params.id);
    res.json({ success: true, message: 'Selection deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const clearStudentSelections = async (req, res) => {
  try {
    await StudentTeacherSelection.deleteByFilters({ student_id: req.params.studentId });
    res.json({ success: true, message: 'All selections cleared for student' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getSelections, getStudentSelections, createSelection, bulkCreateSelections, deleteSelection, clearStudentSelections };
