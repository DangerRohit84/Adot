const pool = require('../config/database');

const migrate = async () => {
  const client = await pool.connect();
  try {
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(
      path.join(__dirname, '../../migrations/001_initial_schema.sql'),
      'utf8'
    );
    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
