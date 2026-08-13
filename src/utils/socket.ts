import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
let io: SocketIOServer;
export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New Client Connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client Disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
