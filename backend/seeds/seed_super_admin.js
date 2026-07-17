require('dotenv').config();
const pool = require('../src/config/database');
const bcrypt = require('bcrypt');

const seedSuperAdmin = async () => {
  try {
    // Check if super admin exists
    const existing = await pool.query("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1");
    if (existing.rows.length > 0) {
      console.log('Super admin already exists');
      return;
    }

    const password_hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Super Admin', 'admin@system.com', password_hash, 'super_admin']
    );
    console.log('Super admin created successfully');
    console.log('Email: admin@system.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    pool.end();
  }
};

seedSuperAdmin();
