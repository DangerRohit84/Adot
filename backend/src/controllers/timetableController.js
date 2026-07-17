const Timetable = require('../models/timetable');
const { parseCSV } = require('../utils/csvParser');

const getTimetable = async (req, res) => {
  try {
    const collegeId = req.user.college_id;
    const timetable = await Timetable.findAll(collegeId, req.query);
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCurrentPeriod = async (req, res) => {
  try {
    const { day, time, section_id } = req.query;
    if (!day || !time || !section_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'day, time, and section_id are required' });
    }
    const entry = await Timetable.findCurrentPeriod(day, time, section_id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'No class at this time' });
    }

    // Check if combined class
    let sections = [entry.section_name];
    if (entry.combined_group_id) {
      const combined = await Timetable.findCombinedGroup(entry.combined_group_id, day, entry.start_period);
      sections = combined.map(c => c.section_name);
    }

    res.json({
      success: true,
      data: {
        ...entry,
        is_combined: !!entry.combined_group_id,
        sections,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Timetable entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createTimetable = async (req, res) => {
  try {
    const data = { ...req.body, college_id: req.user.college_id };
    if (!data.subject_id || !data.teacher_id || !data.day_of_week || !data.start_period || !data.start_time || !data.end_time) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'Missing required fields' });
    }
    const entries = await Timetable.create(data);
    res.status(201).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const bulkUploadTimetable = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'CSV file is required' });
    }
    if (!req.body.section_id) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'section_id is required' });
    }

    const records = parseCSV(req.file.buffer);
    const results = await Timetable.bulkCreate(records, req.user.college_id, req.body.section_id);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    await Timetable.delete(req.params.id);
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getTimetable, getCurrentPeriod, getTimetableEntry, createTimetable, bulkUploadTimetable, deleteTimetable };
