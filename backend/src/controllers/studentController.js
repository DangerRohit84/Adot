const Student = require('../models/student');
const College = require('../models/college');
const { generateQR } = require('../utils/qr');
const { parseCSV } = require('../utils/csvParser');

const getStudents = async (req, res) => {
  try {
    const collegeId = req.user.college_id;
    const students = await Student.findAll(collegeId, req.query);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { roll_number, name, section_id, email, phone } = req.body;
    if (!roll_number || !name || !section_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Roll number, name, and section are required' });
    }

    const college = await College.findById(req.user.college_id);
    const student = await Student.create({
      roll_number, name, section_id, college_id: req.user.college_id, email, phone
    }, college.code);

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'DUPLICATE', message: 'Roll number already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'CSV file is required' });
    }

    const records = parseCSV(req.file.buffer);
    const college = await College.findById(req.user.college_id);
    const results = await Student.bulkCreate(records, req.user.college_id, college.code);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getStudentQR = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Student not found' });
    }
    const qrDataUrl = await generateQR(student.barcode_data);
    res.json({ success: true, data: { qr: qrDataUrl, barcode_data: student.barcode_data } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await Student.update(req.params.id, req.body);
    if (!student) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await Student.delete(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getStudents, getStudent, createStudent, bulkUploadStudents, getStudentQR, updateStudent, deleteStudent };
