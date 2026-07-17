require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { initSocket } = require('./src/utils/socket');

const app = express();
const server = http.createServer(app);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Socket.io
const io = initSocket(server);
app.set('io', io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/colleges', require('./src/routes/colleges'));
app.use('/api/departments', require('./src/routes/departments'));
app.use('/api/sections', require('./src/routes/sections'));
app.use('/api/subjects', require('./src/routes/subjects'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/students', require('./src/routes/students'));
app.use('/api/timetable', require('./src/routes/timetable'));
app.use('/api/attendance', require('./src/routes/attendance'));
app.use('/api/floating-students', require('./src/routes/floatingStudents'));
app.use('/api/reports', require('./src/routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler for API routes - catch unmatched /api/* requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid JSON in request body',
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'FILE_TOO_LARGE',
      message: 'File size exceeds the 10MB limit',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.errorCode || 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`AttendEase API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };
