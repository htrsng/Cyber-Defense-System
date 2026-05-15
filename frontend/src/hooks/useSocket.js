import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../services/api';

/**
 * Hook quản lý WebSocket connection + event listeners
 * Tự động connect khi mount, disconnect khi unmount
 */
export function useSocket(eventHandlers = {}) {
    const socket = getSocket();
    const handlersRef = useRef(eventHandlers);
    const connectionAttempts = useRef(0);
    handlersRef.current = eventHandlers;

    useEffect(() => {
        // Ensure socket is not already connected
        if (!socket.connected) {
            socket.connect();
        }

        // Add connection error handling
        const onConnectError = (error) => {
            console.warn('Socket connection error:', error);
            connectionAttempts.current++;
            if (connectionAttempts.current > 3) {
                console.error('Failed to connect to socket after 3 attempts');
            }
        };

        const onConnect = () => {
            connectionAttempts.current = 0;
            console.log('Socket connected successfully');
        };

        socket.on('connect_error', onConnectError);
        socket.on('connect', onConnect);

        // Đăng ký tất cả event handlers
        const entries = Object.entries(handlersRef.current);
        entries.forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            entries.forEach(([event, handler]) => {
                socket.off(event, handler);
            });
            socket.off('connect_error', onConnectError);
            socket.off('connect', onConnect);
            // Don't disconnect immediately - let it persist for other components
            // socket.disconnect();
        };
    }, []); // eslint-disable-line

    const emit = useCallback((event, data) => {
        if (socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn(`Socket not connected, queuing event: ${event}`);
        }
    }, [socket]);

    return { socket, emit };
}
