import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { JobProgressUpdate } from '../types';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer, frontendUrl: string) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Client joins a room for a specific assignment
    socket.on('join', (data: { assignmentId: string }) => {
      if (data?.assignmentId) {
        socket.join(`assignment:${data.assignmentId}`);
        console.log(`[Socket] ${socket.id} joined room assignment:${data.assignmentId}`);
      }
    });

    socket.on('leave', (data: { assignmentId: string }) => {
      if (data?.assignmentId) {
        socket.leave(`assignment:${data.assignmentId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitProgress(update: JobProgressUpdate) {
  if (!io) return;
  const room = `assignment:${update.assignmentId}`;
  io.to(room).emit('job:progress', update);
}

export function emitComplete(assignmentId: string, result: any) {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit('job:complete', { assignmentId, result });
}

export function emitFailed(assignmentId: string, error: string) {
  if (!io) return;
  io.to(`assignment:${assignmentId}`).emit('job:failed', { assignmentId, error });
}

export function getIO() {
  return io;
}
