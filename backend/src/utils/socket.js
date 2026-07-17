const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-college', (data) => {
      socket.join(`college-${data.college_id}`);
      console.log(`Socket ${socket.id} joined college-${data.college_id}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToCollege = (collegeId, event, data) => {
  if (io) {
    io.to(`college-${collegeId}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToCollege };
