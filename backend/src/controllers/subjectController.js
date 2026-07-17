const Subject = require('../models/subject');
const pool = require('../config/database');

const getSubjects = async (req, res) => {
  try {
    const collegeId = req.user.role === 'super_admin' ? req.query.college_id : req.user.college_id;
    const subjects = await Subject.findAll(collegeId, req.query);
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'All fields are required' });
    }
    const subject = await Subject.create({ name, code, department_id });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.update(req.params.id, req.body);
    if (!subject) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.delete(req.params.id);
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSubjectTeachers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email FROM teacher_subjects ts
       JOIN users u ON ts.teacher_id = u.id
       WHERE ts.subject_id = $1 AND u.is_active = true`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, getSubjectTeachers };
