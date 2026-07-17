const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getColleges, getCollege, createCollege, updateCollege, deleteCollege } = require('../controllers/collegeController');

router.get('/', auth, role('super_admin', 'college_admin'), getColleges);
router.get('/:id', auth, getCollege);
router.post('/', auth, role('super_admin'), createCollege);
router.put('/:id', auth, role('super_admin', 'college_admin'), updateCollege);
router.delete('/:id', auth, role('super_admin'), deleteCollege);

module.exports = router;
