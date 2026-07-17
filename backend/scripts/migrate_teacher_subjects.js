process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const { Pool } = require('pg');

const localPool = new Pool({ connectionString: 'postgresql://postgres:84844@localhost:5432/attendance_db' });
const supaPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  // Create teacher_subjects table if not exists
  await supaPool.query(`
    CREATE TABLE IF NOT EXISTS teacher_subjects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      teacher_id UUID REFERENCES users(id),
      subject_id UUID REFERENCES subjects(id),
      UNIQUE(teacher_id, subject_id)
    )
  `);
  console.log('teacher_subjects table ensured');

  // Migrate data
  const { rows } = await localPool.query('SELECT * FROM teacher_subjects');
  for (const row of rows) {
    try {
      await supaPool.query(
        'INSERT INTO teacher_subjects (id, teacher_id, subject_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [row.id, row.teacher_id, row.subject_id]
      );
    } catch(e) {}
  }
  console.log(`teacher_subjects: ${rows.length} migrated`);

  await localPool.end();
  await supaPool.end();
  process.exit(0);
})();
