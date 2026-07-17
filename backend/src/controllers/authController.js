const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required',
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input types',
      });
    }

    // Find user with college info
    const result = await pool.query(
      `SELECT u.*, c.name as college_name
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      college_id: user.college_id,
      department_id: user.department_id,
      section_id: user.section_id,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    // Return response (exclude sensitive data)
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          college_id: user.college_id,
          college_name: user.college_name,
          department_id: user.department_id,
          section_id: user.section_id,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during login',
    });
  }
};

module.exports = { login };
