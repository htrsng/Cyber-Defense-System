import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/api';

/**
 * Hook quản lý WebSocket connection + event listeners
 * Tự động connect khi mount, disconnect khi unmount
 */
export function useSocket(eventHandlers = {}) {
    const socket = getSocket();
    const handlersRef = useRef(eventHandlers);
    handlersRef.current = eventHandlers;

    useEffect(() => {
        socket.connect();

        // Đăng ký tất cả event handlers
        const entries = Object.entries(handlersRef.current);
        entries.forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            entries.forEach(([event, handler]) => {
                socket.off(event, handler);
            });
            socket.disconnect();
        };
    }, []); // eslint-disable-line

    const emit = useCallback((event, data) => socket.emit(event, data), [socket]);

    return { socket, emit };
}
