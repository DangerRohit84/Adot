export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'college_admin' | 'hod' | 'teacher' | 'scanner';
  college_id?: string;
  college_name?: string;
  is_active?: boolean;
}

export interface College {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  college_id: string;
  hod_id?: string;
  hod_name?: string;
}

export interface Section {
  id: string;
  name: string;
  department_id: string;
  department_name?: string;
  year: number;
  semester: number;
  student_count?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
  department_name?: string;
}

export interface Student {
  id: string;
  roll_number: string;
  name: string;
  section_id: string;
  section_name?: string;
  department_name?: string;
  barcode_data: string;
  email?: string;
  phone?: string;
}

export interface TimetableEntry {
  id: string;
  section_id: string;
  section_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  day_of_week: string;
  start_period: number;
  end_period: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  combined_group_id?: string;
}

export interface AttendanceSession {
  id: string;
  timetable_id: string;
  date: string;
  scanned_by: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
  subject_name?: string;
  section_name?: string;
  scanner_name?: string;
}

export interface AttendanceRecord {
  student_id: string;
  roll_number: string;
  name: string;
  section: string;
  periods: Record<number, 'present' | 'absent' | 'late'>;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
}
