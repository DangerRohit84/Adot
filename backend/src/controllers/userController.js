const User = require('../models/user');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { parse } = require('csv-parse/sync');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll(req.user.college_id, req.query);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTeacherSubjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.code FROM teacher_subjects ts
       JOIN subjects s ON ts.subject_id = s.id
       WHERE ts.teacher_id = $1 AND s.is_active = true`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, department_id, section_id, subject_ids } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Name, email, password, and role are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'DUPLICATE', message: 'Email already exists' });
    }

    const user = await User.create({
      name, email: email.toLowerCase(), phone, password, role,
      college_id: req.user.college_id,
      department_id, section_id
    });

    if (role === 'teacher' && subject_ids && subject_ids.length > 0) {
      for (const subjectId of subject_ids) {
        await pool.query(
          'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user.id, subjectId]
        );
      }
    }

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { role, default_password } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required (hod, teacher, scanner)' });
    }

    const password = default_password || 'college@123';
    const password_hash = await bcrypt.hash(password, 10);
    const csv = req.file.buffer.toString('utf-8');
    const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true });

    let created = 0, skipped = 0, errors = [];

    for (const row of records) {
      const name = row.name || row.Name || '';
      const email = (row.email || row.Email || '').toLowerCase();
      const phone = row.phone || row.Phone || '';

      if (!name || !email) {
        errors.push(`Skipped row: missing name or email`);
        skipped++;
        continue;
      }

      const existing = await User.findByEmail(email);
      if (existing) {
        skipped++;
        continue;
      }

      // Resolve department_id from code or name
      let department_id = null;
      const deptCode = row.department_code || row.department || row.Department || '';
      if (deptCode) {
        const dept = await pool.query('SELECT id FROM departments WHERE (code = $1 OR name = $1) AND college_id = $2', [deptCode, req.user.college_id]);
        if (dept.rows.length > 0) department_id = dept.rows[0].id;
      }

      await pool.query(
        'INSERT INTO users (name, email, phone, password_hash, role, college_id, department_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, email, phone || null, password_hash, role, req.user.college_id, department_id]
      );
      created++;
    }

    res.json({
      success: true,
      message: `Uploaded ${created} ${role}s. Skipped ${skipped}. Default password: ${password}`,
      created, skipped, errors: errors.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, password, subject_ids } = req.body;
    const updateData = { name, email, phone };

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, req.params.id]);
    }

    const user = await User.update(req.params.id, updateData);
    if (!user) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });
    }

    if (subject_ids !== undefined) {
      await pool.query('DELETE FROM teacher_subjects WHERE teacher_id = $1', [req.params.id]);
      for (const subjectId of subject_ids) {
        await pool.query(
          'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.params.id, subjectId]
        );
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getUsers, getUser, getTeacherSubjects, createUser, bulkUploadUsers, updateUser, deleteUser };
