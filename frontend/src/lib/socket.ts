'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL, tokenStore } from './api';

/**
 * Subscribe to real-time events (notifications / messages) over Socket.io.
 * Reconnects with the current access token; cleans up on unmount.
 */
export function useSocket(handlers: Record<string, (payload: any) => void>, enabled = true) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled || !tokenStore.access) return;
    const socket: Socket = io(API_URL, { auth: { token: tokenStore.access }, transports: ['websocket'] });

    const events = Object.keys(handlersRef.current);
    events.forEach((event) => {
      socket.on(event, (payload: any) => handlersRef.current[event]?.(payload));
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
