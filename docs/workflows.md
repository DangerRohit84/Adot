# User Workflows

## Workflow 1: Initial System Setup

```
1. SUPER ADMIN logs in
   → Creates COLLEGE (e.g., "ABC Engineering College")
   → Creates COLLEGE ADMIN account for that college

2. COLLEGE ADMIN logs in
   → Creates HOD accounts for each department

3. HOD logs in
   → Creates DEPARTMENTS (CS, ECE, etc.)
   → Creates SECTIONS for each department (CS2, CS7, CS3, etc.)
   → Creates SUBJECTS (AI, OS, DBMS, etc.)
   → Creates TEACHER accounts and assigns to sections/subjects
   → Creates SCANNER (authorized person) accounts
   → Uploads STUDENTS via CSV (auto-generates QR codes)
   → Uploads TIMETABLE via CSV (auto-creates combined groups)
```

## Workflow 2: Student Data Upload

```
HOD clicks "Upload Students"
  → Selects CSV file
  → CSV contains: roll_number, name, email, phone, section
  → System processes CSV:
      For each row:
        1. Find section by name
        2. Generate unique barcode_data (QR content)
        3. Create student record
        4. Generate QR code image
  → Shows summary: "150 imported, 2 errors"
  → HOD can download QR codes for printing on ID cards
```

## Workflow 3: Timetable Upload

```
HOD clicks "Upload Timetable"
  → Selects CSV file
  → CSV contains: day, start_period, end_period, subject, sections, teacher, room, times
  → System processes CSV:
      For each row:
        1. Find subject, teacher, sections
        2. If sections contains multiple (e.g., "CS2,CS7,CS3"):
            → Create 3 timetable entries (one per section)
            → Link all 3 with same combined_group_id
            → Store time range in start_time, end_time
        3. If single section:
            → Create 1 timetable entry
            → combined_group_id = NULL
  → Shows visual timetable grid matching college format
  → HOD can edit/delete entries
```

## Workflow 4: Daily Attendance Scanning

```
AUTHORIZED SCANNER opens mobile app
  → Logs in with credentials

  → OPTION A: Auto-detect
      App checks: current day + time vs timetable
      → Finds: "Mon 10:15 - OS, periods 3, CS2+CS7+CS3"
      → Shows: "Combined class: OS (CS2, CS7, CS3)"
      → Scanner confirms → Session starts

  → OPTION B: Manual select
      Scanner selects:
        → Day: Monday
        → Section: CS2 (or "Combined: CS2+CS7+CS3")
        → Period: 3 (or range 1-2)
        → Subject: OS
      → Session starts

  → SCANNING:
      Scanner points camera at student QR code
      → App beeps + shows green: "CS2024001 - John Smith - PRESENT"
      → (Multi-period: "Marked present for periods 3-4")
      
      Duplicate scan:
      → App shows yellow warning: "Already marked present"
      → No duplicate record created
      
      Invalid QR:
      → App shows red: "Invalid QR code"

  → STUDENT WITHOUT ID CARD:
      Scanner taps "Manual Add"
      → Searches student by roll number or name
      → Selects student
      → Marks as present manually

  → SESSION ENDS:
      Scanner taps "End Session"
      → System auto-marks remaining students as ABSENT
      → Shows summary: "Present: 140, Absent: 25"
      → Data synced to server (or queued if offline)
```

## Workflow 5: Offline Scanning

```
Scanner opens app with no internet
  → App shows: "Offline Mode - scans will sync later"
  → Scanner logs in (token from last login)
  → App loads cached student data
  → Scanner scans QR codes
  → Each scan saved to local SQLite database
  → When internet returns:
      → App auto-syncs all queued scans
      → Shows: "Synced 45 scans"
      → Server processes each scan (creates attendance records)
```

## Workflow 6: Teacher Views Attendance

```
TEACHER logs in to web portal
  → Dashboard shows:
      → Today's classes
      → Attendance summary per class
  
  → Clicks on a class
      → Sees list of students with present/absent status
      → Can filter by date range
      → Can see period-wise breakdown
  
  → Exports attendance:
      → Clicks "Export"
      → Chooses format (Excel/CSV)
      → Chooses date range
      → Downloads file
```

## Workflow 7: HOD Views Reports

```
HOD logs in to web portal
  → Dashboard shows:
      → Overview of all sections
      → Attendance percentages
      → Alerts for low attendance
  
  → Clicks on a section
      → Subject-wise attendance breakdown
      → Date-wise attendance
      → Student-wise attendance
  
  → Exports report:
      → Selects section + date range
      → Downloads Excel with:
          → Per-student attendance
          → Per-subject attendance
          → Overall percentage
```

## Workflow 8: Manual Attendance Edit

```
TEACHER or HOD notices error in attendance
  → Opens session records
  → Finds student marked absent who was actually present
  → Clicks "Edit" next to student
  → Changes status: absent → present
  → System logs the edit (who changed, when, from what)
  → Updated in reports
```
