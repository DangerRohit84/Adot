const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getSelections, getStudentSelections, createSelection, bulkCreateSelections, deleteSelection, clearStudentSelections } = require('../controllers/studentTeacherSelectionController');

router.get('/', auth, role('hod', 'college_admin'), getSelections);
router.get('/student/:studentId', auth, getStudentSelections);
router.post('/', auth, role('hod'), createSelection);
router.post('/bulk', auth, role('hod'), bulkCreateSelections);
router.delete('/:id', auth, role('hod'), deleteSelection);
router.delete('/student/:studentId', auth, role('hod'), clearStudentSelections);

module.exports = router;
