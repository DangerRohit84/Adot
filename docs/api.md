# API Endpoints Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All routes except `/auth/login` require a JWT token in the header:
```
Authorization: Bearer <token>
```

---

## Auth Routes `/api/auth`

### POST /auth/login
Login with email and password. No registration needed - accounts are created by HOD/College Admin.

**Request:**
```json
{
  "email": "prof.kumar@college.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "name": "Prof. Kumar",
      "email": "prof.kumar@college.com",
      "role": "teacher",
      "college_id": "uuid"
    }
  }
}
```

---

## College Routes `/api/colleges`

### GET /colleges
Get all colleges (super_admin only).

### POST /colleges
Create a college (super_admin only).
```json
{
  "name": "ABC Engineering College",
  "code": "ABCEC",
  "address": "123 College Road, City"
}
```

### GET /colleges/:id
Get college details.

### PUT /colleges/:id
Update college (college_admin only).

---

## Department Routes `/api/departments`

### GET /departments
Get departments for the logged-in user's college.

### POST /departments
Create a department (hod only).
```json
{
  "name": "Computer Science",
  "code": "CS"
}
```

### GET /departments/:id
Get department with section list.

### PUT /departments/:id
Update department.

---

## Section Routes `/api/sections`

### GET /sections
Get sections for the logged-in user's college, optionally filter by department.

**Query params:** `?department_id=uuid&year=2&semester=3`

### POST /sections
Create a section (hod only).
```json
{
  "name": "CS2",
  "department_id": "uuid",
  "year": 2,
  "semester": 3
}
```

### GET /sections/:id
Get section details with student count.

### PUT /sections/:id
Update section.

---

## User Routes `/api/users`

### GET /users
Get users for the college, optionally filter by role.

**Query params:** `?role=teacher&department_id=uuid`

### POST /users
Create a user (hod/college_admin creates teachers and scanners).
```json
{
  "name": "Prof. Kumar",
  "email": "prof.kumar@college.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "teacher",
  "department_id": "uuid",
  "section_id": "uuid"
}
```

### GET /users/:id
Get user details.

### PUT /users/:id
Update user.

### DELETE /users/:id
Deactivate user (soft delete - set is_active = false).

---

## Student Routes `/api/students`

### GET /students
Get students, optionally filter by section.

**Query params:** `?section_id=uuid&college_id=uuid`

### POST /students
Create a single student. QR code is auto-generated.
```json
{
  "roll_number": "CS2024001",
  "name": "John Smith",
  "section_id": "uuid",
  "email": "john@college.com",
  "phone": "9876543210"
}
```

**Response includes:**
```json
{
  "id": "uuid",
  "roll_number": "CS2024001",
  "barcode_data": "auto_generated_unique_qr_content"
}
```

### POST /students/bulk
Upload students via CSV file.

**Request:** `multipart/form-data` with `file` field containing CSV.

**CSV format:**
```csv
roll_number,name,email,phone,section
CS2024001,John Smith,john@college.com,9876543210,CS2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 150,
    "errors": [
      { "row": 5, "error": "Section CS99 not found" }
    ]
  }
}
```

### GET /students/:id
Get student details with attendance summary.

### PUT /students/:id
Update student.

### DELETE /students/:id
Deactivate student.

### GET /students/:id/qr
Get QR code image for a student.

---

## Subject Routes `/api/subjects`

### GET /subjects
Get subjects for the college, optionally filter by department.

### POST /subjects
Create a subject (hod only).
```json
{
  "name": "Artificial Intelligence",
  "code": "CS401",
  "department_id": "uuid"
}
```

### PUT /subjects/:id
Update subject.

### DELETE /subjects/:id
Deactivate subject.

---

## Timetable Routes `/api/timetable`

### GET /timetable
Get timetable with filters.

**Query params:** `?section_id=uuid&day=mon&department_id=uuid`

### POST /timetable
Create a single timetable entry (hod only).
```json
{
  "section_id": "uuid",
  "subject_id": "uuid",
  "teacher_id": "uuid",
  "day_of_week": "mon",
  "start_period": 1,
  "end_period": 2,
  "start_time": "08:30",
  "end_time": "10:00",
  "room_number": "A101"
}
```

### POST /timetable/bulk
Upload timetable via CSV file.

**CSV format:**
```csv
day,start_period,end_period,subject_code,subject_name,sections,teacher_email,room,start_time,end_time
mon,1,2,CS401,AI,"CS2,CS7,CS3",prof.kumar@college.com,A101,08:30,10:00
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 15,
    "combined_groups": 3,
    "errors": []
  }
}
```

### GET /timetable/current
Auto-detect current period based on time.

**Query params:** `?day=mon&time=10:15&section_id=uuid`

**Response:**
```json
{
  "success": true,
  "data": {
    "timetable_entry": {
      "id": "uuid",
      "subject": { "name": "AI", "code": "CS401" },
      "teacher": { "name": "Prof. Kumar" },
      "start_period": 1,
      "end_period": 2,
      "start_time": "08:30",
      "end_time": "10:00",
      "room_number": "A101",
      "is_combined": true,
      "sections": ["CS2", "CS7", "CS3"]
    }
  }
}
```

### PUT /timetable/:id
Update a timetable entry.

### DELETE /timetable/:id
Delete a timetable entry.

---

## Attendance Routes `/api/attendance`

### POST /attendance/session/start
Start a new scan session.

**Request:**
```json
{
  "timetable_id": "uuid",
  "date": "2026-07-16"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "timetable_id": "uuid",
      "date": "2026-07-16",
      "is_active": true
    },
    "students": [
      {
        "id": "uuid",
        "roll_number": "CS2024001",
        "name": "John Smith",
        "barcode_data": "qr_content",
        "section": "CS2"
      }
    ],
    "total_students": 165,
    "periods_covered": [1, 2]
  }
}
```

For combined sections, `students` includes ALL students from ALL sections in the group.

### POST /attendance/scan
Scan a student's QR code.

**Request:**
```json
{
  "session_id": "uuid",
  "barcode_data": "qr_content_from_scan"
}
```

**Response (success):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid",
      "roll_number": "CS2024001",
      "name": "John Smith",
      "section": "CS2"
    },
    "status": "present",
    "periods_marked": [1, 2],
    "message": "Marked present for periods 1-2"
  }
}
```

**Response (duplicate):**
```json
{
  "success": false,
  "error": "ALREADY_MARKED",
  "message": "Already marked present",
  "data": {
    "student": { "name": "John Smith", "roll_number": "CS2024001" }
  }
}
```

### POST /attendance/session/:sessionId/end
End the scan session. Auto-marks remaining students as absent.

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "total_students": 165,
    "present": 140,
    "absent": 25,
    "marked_at": "2026-07-16T11:00:00Z"
  }
}
```

### POST /attendance/manual
Manually mark a student present (for students who forgot ID card).

**Request:**
```json
{
  "session_id": "uuid",
  "student_id": "uuid",
  "status": "present"
}
```

### GET /attendance/session/:sessionId
Get attendance records for a session.

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "date": "2026-07-16",
      "subject": "AI",
      "section": "CS2",
      "teacher": "Prof. Kumar"
    },
    "records": [
      {
        "student_id": "uuid",
        "roll_number": "CS2024001",
        "name": "John Smith",
        "periods": {
          "1": "present",
          "2": "present"
        },
        "scanned_at": "2026-07-16T08:32:15Z"
      }
    ],
    "summary": {
      "total": 165,
      "present": 140,
      "absent": 25
    }
  }
}
```

### GET /attendance/report
Get attendance report with filters.

**Query params:** `?section_id=uuid&subject_id=uuid&start_date=2026-07-01&end_date=2026-07-16`

**Response:**
```json
{
  "success": true,
  "data": {
    "section": "CS2",
    "subject": "AI",
    "report": [
      {
        "student_id": "uuid",
        "roll_number": "CS2024001",
        "name": "John Smith",
        "total_classes": 20,
        "present": 18,
        "absent": 2,
        "attendance_percentage": 90.0
      }
    ]
  }
}
```

### GET /attendance/export
Export attendance as Excel/CSV.

**Query params:** `?section_id=uuid&subject_id=uuid&start_date=2026-07-01&end_date=2026-07-16&format=xlsx`

**Response:** Binary file download (Excel or CSV).

---

## Real-time Events (Socket.io)

### Client connects
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-college', { college_id: 'uuid' });
```

### Scan event (server emits)
```javascript
socket.on('student-scanned', (data) => {
  // data: { session_id, student: {...}, status, periods_marked, timestamp }
});
```

### Session ended (server emits)
```javascript
socket.on('session-ended', (data) => {
  // data: { session_id, summary: { total, present, absent } }
});
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

Common error codes:
- `UNAUTHORIZED` - Not logged in or invalid token
- `FORBIDDEN` - Role doesn't have permission
- `NOT_FOUND` - Resource not found
- `DUPLICATE` - Resource already exists
- `VALIDATION_ERROR` - Invalid input data
- `ALREADY_MARKED` - Student already marked present
