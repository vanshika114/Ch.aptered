import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketInstance;
}

export function useSocket(clubId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!clubId) return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit('join_club', clubId);

    return () => {
      socket.emit('leave_club', clubId);
    };
  }, [clubId]);

  const sendMessage = useCallback((userId: string, username: string, text: string) => {
    if (!clubId || !socketRef.current) return;
    socketRef.current.emit('club_message', { clubId, userId, username, text });
  }, [clubId]);

  const sendTyping = useCallback((userId: string, username: string) => {
    if (!clubId || !socketRef.current) return;
    socketRef.current.emit('club_typing', { clubId, userId, username });
  }, [clubId]);

  const onMessage = useCallback((handler: (msg: any) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on('club_message', handler);
    return () => { socketRef.current?.off('club_message', handler); };
  }, []);

  const onTyping = useCallback((handler: (data: any) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on('club_typing', handler);
    return () => { socketRef.current?.off('club_typing', handler); };
  }, []);

  const onVoteUpdate = useCallback((handler: (data: { clubId: string }) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on('vote_update', handler);
    return () => { socketRef.current?.off('vote_update', handler); };
  }, []);

  const onNotification = useCallback((handler: (data: any) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on('notification', handler);
    return () => { socketRef.current?.off('notification', handler); };
  }, []);

  return { sendMessage, sendTyping, onMessage, onTyping, onVoteUpdate, onNotification };
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
