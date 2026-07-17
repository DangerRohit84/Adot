require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/database');

async function reset() {
  const hash = await bcrypt.hash('college@123', 10);
  console.log('New hash:', hash);
  const match = await bcrypt.compare('college@123', hash);
  console.log('Verify match:', match);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'Rohit@gmail.com']);
  console.log('Password updated');
  pool.end();
}
reset();
