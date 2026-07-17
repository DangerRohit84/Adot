# Backend Implementation Plan

Node.js + Express + PostgreSQL API server.

## Setup Steps

### 1. Initialize Project
```bash
cd backend
npm init -y
npm install express pg bcrypt jsonwebtoken cors dotenv helmet morgan multer uuid qrcode exceljs socket.io
npm install -D nodemon
```

### 2. File Structure
```
backend/
├── package.json
├── .env
├── .env.example
├── server.js                    # Entry point, starts Express
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL pool connection
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── role.js              # Role-based access control
│   │   ├── upload.js            # Multer config for CSV uploads
│   │   └── validate.js          # Input validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── collegeController.js
│   │   ├── departmentController.js
│   │   ├── sectionController.js
│   │   ├── userController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── timetableController.js
│   │   ├── attendanceController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── college.js
│   │   ├── department.js
│   │   ├── section.js
│   │   ├── user.js
│   │   ├── student.js
│   │   ├── subject.js
│   │   ├── timetable.js
│   │   ├── attendanceSession.js
│   │   └── attendanceRecord.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── colleges.js
│   │   ├── departments.js
│   │   ├── sections.js
│   │   ├── users.js
│   │   ├── students.js
│   │   ├── subjects.js
│   │   ├── timetable.js
│   │   ├── attendance.js
│   │   └── reports.js
│   └── utils/
│       ├── qr.js                # QR code generation
│       ├── excel.js             # Excel/CSV generation
│       ├── csvParser.js         # CSV file parsing
│       └── socket.js            # Socket.io setup
├── migrations/
│   └── 001_initial_schema.sql   # All CREATE TABLE statements
└── seeds/
    └── seed_super_admin.js      # Create initial super admin
```

## Implementation Order

### Step 1: Project Config
Files to create:
- `backend/package.json` - dependencies
- `backend/.env` - DATABASE_URL, JWT_SECRET, PORT
- `backend/.env.example` - template
- `backend/server.js` - Express app setup, middleware, routes, listen

### Step 2: Database Connection
Files to create:
- `backend/src/config/database.js` - PostgreSQL pool with pg

### Step 3: Migrations
Files to create:
- `backend/migrations/001_initial_schema.sql` - All 9 tables from docs/schema.md

### Step 4: Auth
Files to create:
- `backend/src/middleware/auth.js` - JWT verification
- `backend/src/middleware/role.js` - Role checking
- `backend/src/controllers/authController.js` - Login logic
- `backend/src/routes/auth.js` - POST /login

### Step 5: CRUD - Colleges, Departments, Sections, Subjects
Files to create:
- `backend/src/models/college.js` - DB queries
- `backend/src/controllers/collegeController.js` - Route handlers
- `backend/src/routes/colleges.js` - Express routes
- (Same pattern for departments, sections, subjects)

### Step 6: User Management
Files to create:
- `backend/src/models/user.js` - DB queries, password hashing
- `backend/src/controllers/userController.js` - CRUD + bulk
- `backend/src/routes/users.js` - Express routes

### Step 7: Student Management + QR Generation
Files to create:
- `backend/src/utils/qr.js` - Generate QR code as data URL
- `backend/src/utils/csvParser.js` - Parse uploaded CSV files
- `backend/src/models/student.js` - DB queries
- `backend/src/controllers/studentController.js` - CRUD + bulk upload + QR
- `backend/src/routes/students.js` - Express routes
- `backend/src/middleware/upload.js` - Multer for file uploads

### Step 8: Timetable Management
Files to create:
- `backend/src/models/timetable.js` - DB queries, combined group logic
- `backend/src/controllers/timetableController.js` - CRUD + bulk + auto-detect
- `backend/src/routes/timetable.js` - Express routes

### Step 9: Attendance System (Core)
Files to create:
- `backend/src/models/attendanceSession.js` - Session DB queries
- `backend/src/models/attendanceRecord.js` - Record DB queries
- `backend/src/controllers/attendanceController.js` - Start session, scan, end session, manual mark
- `backend/src/routes/attendance.js` - Express routes

### Step 10: Reports + Export
Files to create:
- `backend/src/utils/excel.js` - Excel/CSV generation with exceljs
- `backend/src/controllers/reportController.js` - Report queries
- `backend/src/routes/reports.js` - Express routes

### Step 11: Socket.io Real-time
Files to create:
- `backend/src/utils/socket.js` - Socket.io setup, join room, emit events

### Step 12: Seed Data
Files to create:
- `backend/seeds/seed_super_admin.js` - Create default super admin

## Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0",
    "qrcode": "^1.5.3",
    "exceljs": "^4.4.0",
    "socket.io": "^4.7.2",
    "csv-parse": "^5.5.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

## Environment Variables (.env)
```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
