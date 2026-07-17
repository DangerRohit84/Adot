const Section = require('../models/section');
const pool = require('../config/database');

const getSections = async (req, res) => {
  try {
    const collegeId = req.user.role === 'super_admin' ? req.query.college_id : req.user.college_id;
    const sections = await Section.findAll(collegeId, req.query);
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Section not found' });
    }
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSection = async (req, res) => {
  try {
    const { name, department_id, year, semester } = req.body;
    if (!name || !department_id || !year || !semester) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'All fields are required' });
    }
    const section = await Section.create({ name, department_id, year, semester });
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSection = async (req, res) => {
  try {
    const section = await Section.update(req.params.id, req.body);
    if (!section) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Section not found' });
    }
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    await Section.delete(req.params.id);
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const promoteStudents = async (req, res) => {
  const client = await pool.connect();
  try {
    const { department_id, from_year, to_year } = req.body;
    if (!department_id || !from_year || !to_year) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'department_id, from_year, and to_year are required' });
    }

    await client.query('BEGIN');

    const currentSections = await client.query(
      'SELECT id, name FROM sections WHERE department_id = $1 AND year = $2 AND is_active = true',
      [department_id, from_year]
    );

    if (currentSections.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `No sections found for year ${from_year}` });
    }

    let promoted = 0;
    let created = 0;
    let archived = 0;

    for (const sec of currentSections.rows) {
      const newSecName = sec.name.replace(`Y${from_year}`, `Y${to_year}`).replace(`${from_year}`, `${to_year}`);

      let newSection = await client.query(
        'SELECT id FROM sections WHERE name = $1 AND department_id = $2',
        [newSecName, department_id]
      );

      if (newSection.rows.length === 0) {
        newSection = await client.query(
          'INSERT INTO sections (name, department_id, year, semester) VALUES ($1, $2, $3, $4) RETURNING id',
          [newSecName, department_id, to_year, 1]
        );
        created++;
      } else {
        newSection = { rows: [{ id: newSection.rows[0].id }] };
      }

      const result = await client.query(
        'UPDATE students SET section_id = $1 WHERE section_id = $2 AND is_active = true',
        [newSection.rows[0].id, sec.id]
      );
      promoted += result.rowCount;

      await client.query(
        'UPDATE sections SET is_active = false WHERE id = $1',
        [sec.id]
      );
      archived++;
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Promoted ${promoted} students from year ${from_year} to year ${to_year}`,
      data: { promoted, created_sections: created, archived_sections: archived }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { getSections, getSection, createSection, updateSection, deleteSection, promoteStudents };
