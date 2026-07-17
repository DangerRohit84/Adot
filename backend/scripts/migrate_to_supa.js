require('dotenv').config();
const { Pool } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const localPool = new Pool({ connectionString: 'postgresql://postgres:84844@localhost:5432/attendance_db' });
const supaPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    // Step 1: Get all data from local
    console.log('Reading local data...');
    const colleges = (await localPool.query('SELECT * FROM colleges')).rows;
    const users = (await localPool.query('SELECT * FROM users')).rows;
    const departments = (await localPool.query('SELECT * FROM departments')).rows;
    const sections = (await localPool.query('SELECT * FROM sections')).rows;
    const subjects = (await localPool.query('SELECT * FROM subjects')).rows;
    const timetables = (await localPool.query('SELECT * FROM timetables')).rows;
    const students = (await localPool.query('SELECT * FROM students')).rows;
    const teacherSubjects = (await localPool.query('SELECT * FROM teacher_subjects')).rows;

    // Step 2: Temporarily disable FK checks
    await supaPool.query('SET session_replication_role = replica');
    console.log('FK checks disabled');

    // Step 3: Clear existing data
    const clearOrder = ['attendance_records','attendance_sessions','floating_attendance','floating_students','student_teacher_selections','teacher_subjects','timetables','students','subjects','sections','departments','users','colleges'];
    for (const t of clearOrder) {
      try { await supaPool.query(`DELETE FROM "${t}"`); } catch(e) {}
    }
    // Also delete the seeded super admin
    await supaPool.query("DELETE FROM users WHERE email = 'admin@system.com'");
    console.log('Cleared existing data');

    // Step 4: Insert in order
    async function insertRows(table, rows) {
      if (rows.length === 0) { console.log(`${table}: 0 rows (skip)`); return; }
      const cols = Object.keys(rows[0]);
      const colList = cols.map(c => `"${c}"`).join(',');
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
      let ok = 0;
      for (const row of rows) {
        const values = cols.map(c => row[c]);
        try {
          await supaPool.query(`INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`, values);
          ok++;
        } catch(e) {
          console.log(`  ${table} row error: ${e.message.substring(0, 100)}`);
        }
      }
      console.log(`${table}: ${ok}/${rows.length} migrated`);
    }

    await insertRows('colleges', colleges);
    await insertRows('users', users);
    await insertRows('departments', departments);
    await insertRows('sections', sections);
    await insertRows('subjects', subjects);
    await insertRows('timetables', timetables);
    await insertRows('students', students);
    await insertRows('teacher_subjects', teacherSubjects);

    // Step 5: Re-enable FK checks
    await supaPool.query('SET session_replication_role = origin');
    console.log('FK checks re-enabled');

    console.log('\nMigration complete!');
  } catch(e) {
    console.error('FATAL:', e.message);
  }
  await localPool.end();
  await supaPool.end();
  process.exit(0);
})();
