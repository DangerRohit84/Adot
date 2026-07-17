const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getFloatingStudents, addFloatingStudent, removeFloatingStudent, getStudentFloats } = require('../controllers/floatingStudentController');

router.get('/', auth, role('hod'), getFloatingStudents);
router.post('/', auth, role('hod'), addFloatingStudent);
router.delete('/:id', auth, role('hod'), removeFloatingStudent);
router.get('/student/:studentId', auth, getStudentFloats);

module.exports = router;
