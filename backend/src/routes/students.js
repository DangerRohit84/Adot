const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { getStudents, getStudent, createStudent, bulkUploadStudents, getStudentQR, updateStudent, deleteStudent } = require('../controllers/studentController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod', 'teacher', 'scanner'), getStudents);
router.get('/:id', auth, getStudent);
router.get('/:id/qr', auth, getStudentQR);
router.post('/', auth, role('college_admin', 'hod'), createStudent);
router.post('/bulk', auth, role('college_admin', 'hod'), upload.single('file'), bulkUploadStudents);
router.put('/:id', auth, role('college_admin', 'hod'), updateStudent);
router.delete('/:id', auth, role('college_admin', 'hod'), deleteStudent);

module.exports = router;
