const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getSections, getSection, createSection, updateSection, deleteSection, promoteStudents } = require('../controllers/sectionController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod', 'teacher', 'scanner'), getSections);
router.get('/:id', auth, getSection);
router.post('/', auth, role('college_admin', 'hod'), createSection);
router.put('/:id', auth, role('college_admin', 'hod'), updateSection);
router.delete('/:id', auth, role('college_admin', 'hod'), deleteSection);
router.post('/promote', auth, role('college_admin', 'hod'), promoteStudents);

module.exports = router;
