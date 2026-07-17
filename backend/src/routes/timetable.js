const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { getTimetable, getCurrentPeriod, getTimetableEntry, createTimetable, bulkUploadTimetable, deleteTimetable } = require('../controllers/timetableController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod', 'teacher', 'scanner'), getTimetable);
router.get('/current', auth, role('scanner'), getCurrentPeriod);
router.get('/:id', auth, getTimetableEntry);
router.post('/', auth, role('college_admin', 'hod'), createTimetable);
router.post('/bulk', auth, role('college_admin', 'hod'), upload.single('file'), bulkUploadTimetable);
router.delete('/:id', auth, role('college_admin', 'hod'), deleteTimetable);

module.exports = router;
