-- Student-Teacher Selections: which teacher each student chose per subject
-- Supports the floating class system where students pick their preferred teacher

CREATE TABLE IF NOT EXISTS student_teacher_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    college_id UUID REFERENCES colleges(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, subject_id)
);

CREATE INDEX idx_sts_student ON student_teacher_selections(student_id);
CREATE INDEX idx_sts_teacher_subject ON student_teacher_selections(teacher_id, subject_id);
CREATE INDEX idx_sts_section ON student_teacher_selections(section_id);
