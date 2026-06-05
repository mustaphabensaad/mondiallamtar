import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      autoConnect: true,
    });
  }
  return socket;
}

export function useSocket(matchId, handlers = {}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const s = getSocket();

    if (matchId) {
      s.emit('join_match', matchId);
    }

    const entries = Object.entries(handlersRef.current);
    entries.forEach(([event, handler]) => s.on(event, handler));

    return () => {
      entries.forEach(([event, handler]) => s.off(event, handler));
      if (matchId) s.emit('leave_match', matchId);
    };
  }, [matchId]);

  return getSocket();
}
