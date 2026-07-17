const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { getUsers, getUser, createUser, bulkUploadUsers, updateUser, deleteUser, getTeacherSubjects } = require('../controllers/userController');

router.get('/', auth, role('super_admin', 'college_admin', 'hod'), getUsers);
router.get('/:id/subjects', auth, getTeacherSubjects);
router.get('/:id', auth, getUser);
router.post('/', auth, role('college_admin', 'hod'), createUser);
router.post('/bulk', auth, role('college_admin', 'hod'), upload.single('file'), bulkUploadUsers);
router.put('/:id', auth, role('college_admin', 'hod'), updateUser);
router.delete('/:id', auth, role('college_admin', 'hod'), deleteUser);

module.exports = router;
