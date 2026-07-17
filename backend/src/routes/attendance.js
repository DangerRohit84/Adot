const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getSessions, startSession, scanStudent, endSession, manualMark, getSessionRecords } = require('../controllers/attendanceController');

router.get('/', auth, getSessions);
router.post('/session/start', auth, role('scanner', 'hod', 'teacher'), startSession);
router.post('/scan', auth, role('scanner'), scanStudent);
router.post('/session/:sessionId/end', auth, role('scanner', 'hod', 'teacher'), endSession);
router.post('/manual', auth, role('scanner', 'hod', 'teacher'), manualMark);
router.get('/session/:sessionId', auth, getSessionRecords);

module.exports = router;
