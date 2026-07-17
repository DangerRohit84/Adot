// Shared constants across backend, mobile, and web

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COLLEGE_ADMIN: 'college_admin',
  HOD: 'hod',
  TEACHER: 'teacher',
  SCANNER: 'scanner',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const PERIODS = {
  1: { start: '08:30', end: '09:15', label: 'Period 1' },
  2: { start: '09:15', end: '10:00', label: 'Period 2' },
  3: { start: '10:15', end: '11:00', label: 'Period 3' },
  4: { start: '11:00', end: '11:45', label: 'Period 4' },
  5: { start: '12:45', end: '13:30', label: 'Period 5' },
  6: { start: '13:30', end: '14:15', label: 'Period 6' },
  7: { start: '14:30', end: '15:15', label: 'Period 7' },
  8: { start: '15:15', end: '16:00', label: 'Period 8' },
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

const SCAN_RESULT = {
  SUCCESS: 'success',
  DUPLICATE: 'duplicate',
  INVALID: 'invalid',
  ERROR: 'error',
};

module.exports = {
  ROLES,
  DAYS,
  PERIODS,
  ATTENDANCE_STATUS,
  SCAN_RESULT,
};
