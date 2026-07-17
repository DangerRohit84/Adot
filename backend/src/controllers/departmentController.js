const Department = require('../models/department');

const getDepartments = async (req, res) => {
  try {
    const collegeId = req.user.role === 'super_admin' ? req.query.college_id : req.user.college_id;
    const departments = await Department.findAll(collegeId);
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, hod_id } = req.body;
    const college_id = req.user.college_id;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Name and code are required' });
    }
    const department = await Department.create({ name, code, college_id, hod_id });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.update(req.params.id, req.body);
    if (!department) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.delete(req.params.id);
    res.json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
