# College Attendance Management System

A complete attendance solution with QR code scanning mobile app and web management portal.

## Problem
Manual attendance in colleges is slow and error-prone. This system automates it with QR code scanning and maps attendance to timetables automatically.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                           │
│            Creates College credentials                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  COLLEGE ADMIN                           │
│           Creates HODs for departments                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                       HOD                                │
│  - Adds Teachers & Authorized Scanner persons            │
│  - Uploads Student data (CSV) → QR codes auto-generated │
│  - Uploads Timetable (CSV) → Visual grid                │
│  - Views attendance reports                              │
└──────┬──────────────────────────────┬───────────────────┘
       │                              │
┌──────▼──────┐              ┌────────▼────────┐
│   TEACHER   │              │ AUTHORIZED      │
│ Dashboard   │              │ SCANNER (App)   │
│ View attend │              │ Scan QR codes   │
│ Export data │              │ Mark present/   │
│ Edit records│              │ absent          │
└─────────────┘              └────────┬────────┘
                                      │
                              ┌───────▼───────┐
                              │   STUDENT     │
                              │ Shows QR code │
                              │ on ID card    │
                              └───────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Mobile App | React Native + Expo |
| Web Portal | Next.js 14 + Tailwind CSS + shadcn/ui |
| Backend API | Node.js + Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| QR Generation | qrcode npm package |
| Excel Export | exceljs |
| Barcode Scanning | expo-camera |

## Key Features

### Multi-Period Subjects
- Subjects spanning 2+ periods (e.g., AI in periods 1-2)
- One scan marks attendance for ALL periods in the range
- Schema uses `start_period` and `end_period`

### Combined Sections
- Multiple sections in one class (CS2+CS7+CS3 for OS)
- Linked via `combined_group_id` in timetable
- Scanner loads all students from all sections
- Auto-maps scanned student to their section

### Offline Mode (Mobile App)
- Scans queued locally when no internet
- Auto-syncs when connection returns
- No data lost

### Duplicate Scan Prevention
- Shows warning "Already marked present"
- No duplicate records created

### Auto Absent Marking
- When session ends, unscanned students → auto-marked ABSENT
- Teacher/HOD can manually edit later

## Project Structure

```
D:\Adot\
├── README.md                    # This file
├── docs/
│   ├── schema.md               # Database schema
│   ├── api.md                  # API endpoints documentation
│   ├── workflows.md            # User workflows
│   └── CHECKLIST.md            # Implementation checklist
│
├── backend/                     # Node.js + Express API
│   ├── PLAN.md                 # Backend implementation plan
│   ├── src/
│   │   ├── config/             # DB connection, env config
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, validation
│   │   ├── models/            # Database queries
│   │   ├── routes/            # API routes
│   │   └── utils/             # Helpers (excel, qr)
│   ├── migrations/            # DB migrations
│   └── seeds/                 # Seed data
│
├── mobile/                      # React Native App
│   ├── PLAN.md                 # Mobile app implementation plan
│   └── src/
│       ├── screens/            # App screens
│       ├── components/         # Reusable components
│       ├── services/           # API calls
│       └── utils/              # Helpers
│
├── web/                         # Next.js Web Portal
│   ├── PLAN.md                 # Web portal implementation plan
│   └── src/
│       ├── app/                # Next.js app router pages
│       │   ├── admin/          # Super Admin pages
│       │   ├── college/        # College Admin pages
│       │   ├── hod/            # HOD dashboard pages
│       │   ├── teacher/        # Teacher dashboard pages
│       │   └── scanner/        # Scanner web view
│       ├── components/         # Reusable UI components
│       └── lib/                # API client, auth helpers
│
└── shared/
    └── constants.js            # Shared constants
```

## Build Order

| Phase | Task | Status |
|-------|------|--------|
| 1 | Backend API foundation | NOT STARTED |
| 2 | Website - HOD data setup | NOT STARTED |
| 3 | Mobile App - QR scanning | NOT STARTED |
| 4 | Website - Teacher dashboard | NOT STARTED |
| 5 | Real-time sync + polish | NOT STARTED |

## Database Schema
See [docs/schema.md](docs/schema.md)

## API Documentation
See [docs/api.md](docs/api.md)

## Backend Plan
See [backend/PLAN.md](backend/PLAN.md)

## Mobile App Plan
See [mobile/PLAN.md](mobile/PLAN.md)

## Web Portal Plan
See [web/PLAN.md](web/PLAN.md)

## Implementation Checklist
See [docs/CHECKLIST.md](docs/CHECKLIST.md)
