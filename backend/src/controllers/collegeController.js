const College = require('../models/college');
const User = require('../models/user');

const getColleges = async (req, res) => {
  try {
    const colleges = await College.findAll();
    res.json({ success: true, data: colleges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'College not found' });
    }
    res.json({ success: true, data: college });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createCollege = async (req, res) => {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Name and code are required' });
    }
    const college = await College.create({ name, code, address, created_by: req.user.id });

    // Auto-create college admin with default password
    const adminEmail = `admin@${code.toLowerCase()}.com`;
    const adminUser = await User.create({
      name: `${name} Admin`,
      email: adminEmail,
      phone: null,
      password: 'college@123',
      role: 'college_admin',
      college_id: college.id,
      department_id: null,
      section_id: null,
    });

    res.status(201).json({
      success: true,
      data: college,
      admin: {
        email: adminEmail,
        password: 'college@123',
        message: `College admin created. Login: ${adminEmail} / college@123`,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'DUPLICATE', message: 'College code already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateCollege = async (req, res) => {
  try {
    const college = await College.update(req.params.id, req.body);
    if (!college) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'College not found' });
    }
    res.json({ success: true, data: college });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteCollege = async (req, res) => {
  try {
    await College.delete(req.params.id);
    res.json({ success: true, message: 'College deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getColleges, getCollege, createCollege, updateCollege, deleteCollege };
