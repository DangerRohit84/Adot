const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod'), getDepartments);
router.get('/:id', auth, getDepartment);
router.post('/', auth, role('college_admin', 'hod'), createDepartment);
router.put('/:id', auth, role('college_admin', 'hod'), updateDepartment);
router.delete('/:id', auth, role('college_admin', 'hod'), deleteDepartment);

module.exports = router;
