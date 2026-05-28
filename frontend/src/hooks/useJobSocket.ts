'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '../store/assignment.store';
import type { JobProgress, GeneratedPaper } from '../types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketInstance;
}

export function useJobSocket(assignmentId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const { updateProgress, setGeneratedPaper, setJobFailed } = useAssignmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Join the room for this assignment
    socket.emit('join', { assignmentId });

    const onProgress = (data: JobProgress) => {
      if (data.assignmentId === assignmentId) {
        updateProgress(data);
      }
    };

    const onComplete = (data: { assignmentId: string; result: GeneratedPaper }) => {
      if (data.assignmentId === assignmentId) {
        setGeneratedPaper(data.result);
      }
    };

    const onFailed = (data: { assignmentId: string; error: string }) => {
      if (data.assignmentId === assignmentId) {
        setJobFailed(data.error);
      }
    };

    socket.on('job:progress', onProgress);
    socket.on('job:complete', onComplete);
    socket.on('job:failed', onFailed);

    return () => {
      socket.emit('leave', { assignmentId });
      socket.off('job:progress', onProgress);
      socket.off('job:complete', onComplete);
      socket.off('job:failed', onFailed);
    };
  }, [assignmentId]);

  return socketRef.current;
}
