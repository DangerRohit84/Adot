const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getAttendanceReport, exportAttendance } = require('../controllers/reportController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod', 'teacher'), getAttendanceReport);
router.get('/export', auth, role('super_admin', 'college_admin', 'hod', 'teacher'), exportAttendance);

module.exports = router;
