-- Floating Students: allow students to attend other sections' classes
-- HOD maps which students can float to which sections

CREATE TABLE IF NOT EXISTS floating_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    target_section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    source_section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    reason TEXT,
    approved_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, target_section_id, source_section_id)
);

-- Track floating attendance separately
CREATE TABLE IF NOT EXISTS floating_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    original_section_id UUID REFERENCES sections(id),
    attended_section_id UUID REFERENCES sections(id),
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_floating_students_lookup ON floating_students(student_id, target_section_id);
CREATE INDEX idx_floating_attendance_session ON floating_attendance(session_id);
