const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getSubjects, getSubject, createSubject, updateSubject, deleteSubject, getSubjectTeachers } = require('../controllers/subjectController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod', 'teacher'), getSubjects);
router.get('/:id/teachers', auth, getSubjectTeachers);
router.get('/:id', auth, getSubject);
router.post('/', auth, role('college_admin', 'hod'), createSubject);
router.put('/:id', auth, role('college_admin', 'hod'), updateSubject);
router.delete('/:id', auth, role('college_admin', 'hod'), deleteSubject);

module.exports = router;
