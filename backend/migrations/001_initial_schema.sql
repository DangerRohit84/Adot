-- College Attendance Management System
-- Database Migration

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Colleges
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    hod_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code, college_id)
);

-- 3. Sections
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, department_id)
);

-- 4. Users (all roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN (
        'super_admin', 'college_admin', 'hod', 'teacher', 'scanner'
    )),
    college_id UUID REFERENCES colleges(id),
    department_id UUID REFERENCES departments(id),
    section_id UUID REFERENCES sections(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign keys after users table exists
ALTER TABLE colleges ADD CONSTRAINT fk_colleges_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE departments ADD CONSTRAINT fk_departments_hod_id
    FOREIGN KEY (hod_id) REFERENCES users(id);

-- 5. Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code, department_id)
);

-- 6. Timetables
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id),
    teacher_id UUID REFERENCES users(id),
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN (
        'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
    )),
    start_period INTEGER NOT NULL CHECK (start_period BETWEEN 1 AND 8),
    end_period INTEGER NOT NULL CHECK (end_period BETWEEN 1 AND 8),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    combined_group_id UUID,
    college_id UUID REFERENCES colleges(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (end_period >= start_period)
);

CREATE INDEX idx_timetable_lookup
    ON timetables(day_of_week, start_time, end_time, college_id);

-- 7. Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    barcode_data VARCHAR(255) UNIQUE NOT NULL,
    college_id UUID REFERENCES colleges(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(roll_number, college_id)
);

-- 8. Attendance Sessions
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID REFERENCES timetables(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    scanned_by UUID REFERENCES users(id),
    college_id UUID REFERENCES colleges(id),
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- 9. Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    scanned_at TIMESTAMP,
    barcode_raw VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, student_id, period_number)
);
