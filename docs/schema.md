# Database Schema

PostgreSQL database with 9 tables.

## Entity Relationship

```
colleges ──< departments ──< sections ──< students
    │            │              │
    │            │              └──< timetables >── subjects
    │            │                        │
    │            └──< users (hod)         │
    │                                     │
    └──< users (college_admin, teacher, scanner)
                                       │
                              attendance_sessions
                                       │
                              attendance_records
```

## Tables

### 1. colleges
```sql
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,          -- e.g., "CSM", "CSE"
    address TEXT,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. departments
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                -- e.g., "Computer Science"
    code VARCHAR(50) NOT NULL,                 -- e.g., "CS"
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    hod_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code, college_id)
);
```

### 3. sections
```sql
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,                 -- e.g., "CS2", "CS7", "CS3"
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, department_id)
);
```

### 4. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN (
        'super_admin',      -- Platform level, creates colleges
        'college_admin',    -- Created by super_admin, creates HODs
        'hod',              -- Head of Department
        'teacher',          -- Assigned to sections/subjects
        'scanner'           -- Authorized person who scans QR codes
    )),
    college_id UUID REFERENCES colleges(id),
    department_id UUID REFERENCES departments(id),  -- For HOD/teacher
    section_id UUID REFERENCES sections(id),        -- For teacher assignment
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. subjects
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                -- e.g., "Artificial Intelligence"
    code VARCHAR(50) NOT NULL,                 -- e.g., "CS401"
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(code, department_id)
);
```

### 6. timetables
```sql
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id),
    teacher_id UUID REFERENCES users(id),
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN (
        'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
    )),
    start_period INTEGER NOT NULL CHECK (start_period BETWEEN 1 AND 8),
    end_period INTEGER NOT NULL CHECK (end_period BETWEEN 1 AND 8),
    start_time TIME NOT NULL,                   -- e.g., 08:30
    end_time TIME NOT NULL,                     -- e.g., 10:00 (for multi-period)
    room_number VARCHAR(50),
    combined_group_id UUID,                     -- NULL = standalone, same UUID = combined sections
    college_id UUID REFERENCES colleges(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure end_period >= start_period
    CHECK (end_period >= start_period)
);

-- Index for quick timetable lookups (auto-detect current period)
CREATE INDEX idx_timetable_lookup
    ON timetables(day_of_week, start_time, end_time, college_id);
```

### 7. attendance_sessions
```sql
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_id UUID REFERENCES timetables(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    scanned_by UUID REFERENCES users(id),      -- The authorized scanner
    college_id UUID REFERENCES colleges(id),
    is_active BOOLEAN DEFAULT true,            -- Currently open session
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);
```

### 8. attendance_records
```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id),
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    scanned_at TIMESTAMP,
    barcode_raw VARCHAR(255),                   -- Raw scanned QR value
    created_at TIMESTAMP DEFAULT NOW(),

    -- One record per student per period per session
    UNIQUE(session_id, student_id, period_number)
);
```

### 9. students
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(50) NOT NULL,           -- Unique per college
    name VARCHAR(255) NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    barcode_data VARCHAR(255) UNIQUE NOT NULL,  -- QR code content (unique globally)
    college_id UUID REFERENCES colleges(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(roll_number, college_id)
);
```

## CSV Upload Formats

### Students CSV
```csv
roll_number,name,email,phone,section
CS2024001,John Smith,john@college.com,9876543210,CS2
CS2024002,Jane Doe,jane@college.com,9876543211,CS2
CS7204001,Bob Wilson,bob@college.com,9876543212,CS7
```

### Timetable CSV
```csv
day,start_period,end_period,subject_code,subject_name,section,teacher_email,room,start_time,end_time
mon,1,2,CS401,AI,CS2,prof.kumar@college.com,A101,08:30,10:00
mon,3,3,CS402,OS,"CS2,CS7,CS3",prof.singh@college.com,A102,10:15,11:00
```

When `section` column contains multiple values (e.g., "CS2,CS7,CS3"), the system:
1. Creates individual timetable entries for each section
2. Links them with the same `combined_group_id`
3. Stores the time range in `start_time` and `end_time`

## Key Queries

### Auto-detect current period
```sql
SELECT t.*, s.name as subject_name, u.name as teacher_name
FROM timetables t
JOIN subjects s ON t.subject_id = s.id
JOIN users u ON t.teacher_id = u.id
WHERE t.day_of_week = $1                    -- e.g., 'mon'
  AND t.start_time <= $2                    -- current time, e.g., '10:15'
  AND t.end_time >= $2
  AND t.college_id = $3
  AND t.is_active = true;
```

### Get all students for a session (standalone)
```sql
SELECT id, roll_number, name, barcode_data
FROM students
WHERE section_id = $1
  AND is_active = true;
```

### Get all students for a combined session
```sql
SELECT id, roll_number, name, barcode_data, section_id
FROM students
WHERE section_id IN (
    SELECT section_id FROM timetables
    WHERE combined_group_id = $1
      AND day_of_week = $2
      AND start_period = $3
)
AND is_active = true;
```

### Get attendance report
```sql
SELECT
    st.roll_number,
    st.name,
    sec.name as section,
    sub.name as subject,
    ar.period_number,
    ar.status,
    ar.scanned_at
FROM attendance_records ar
JOIN students st ON ar.student_id = st.id
JOIN sections sec ON st.section_id = sec.id
JOIN attendance_sessions att_s ON ar.session_id = att_s.id
JOIN timetables t ON att_s.timetable_id = t.id
JOIN subjects sub ON t.subject_id = sub.id
WHERE att_s.date = $1                        -- specific date
  AND sec.id = $2                            -- specific section
ORDER BY st.roll_number, ar.period_number;
```
