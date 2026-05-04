import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useSocket = (userId) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      query: { userId },
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('new_message', (message) => {
      setMessages((prev) => [message, ...prev]);
    });

    socket.on('message_sent', (message) => {
      setMessages((prev) => [message, ...prev]);
    });

    socket.on('message_read', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, readAt: new Date() } : msg
        )
      );
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('send_message', data);
    }
  }, [connected]);

  const markAsRead = useCallback((messageId, userId, senderId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('mark_read', { messageId, userId, senderId });
    }
  }, [connected]);

  return {
    socket: socketRef.current,
    messages,
    connected,
    error,
    sendMessage,
    markAsRead,
  };
};

export default useSocket;
