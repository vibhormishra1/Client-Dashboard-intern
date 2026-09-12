import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from './socket';
import { useAuthStore } from '../store/auth.store';
import { useActivityStore } from '../store/activity.store';
import { useNotificationStore } from '../store/notification.store';
import { useTaskStore } from '../store/task.store';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, accessToken } = useAuthStore();
  const { addActivity, setActivities } = useActivityStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const { updateTaskStatus } = useTaskStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
      }
      return;
    }

    const socket = initSocket(accessToken);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      // Request catch-up events for the last 24 hours
      socket.emit('catch-up', { lastSeenAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() });
    });

    socket.on('catch-up:events', (events) => {
      setActivities(events.reverse()); // Set events (newest first after reverse)
    });

    socket.on('activity:new', (event) => {
      addActivity(event);
    });

    socket.on('task:updated', ({ taskId, newStatus }) => {
      updateTaskStatus(taskId, newStatus);
    });

    socket.on('notification:new', (notification) => {
      addNotification(notification);
    });

    socket.on('notification:count', ({ count }) => {
      setUnreadCount(count);
    });

    return () => {
      socket.off('connect');
      socket.off('catch-up:events');
      socket.off('activity:new');
      socket.off('task:updated');
      socket.off('notification:new');
      socket.off('notification:count');
    };
  }, [isAuthenticated, accessToken, addActivity, setActivities, addNotification, setUnreadCount, updateTaskStatus]);

  return socketRef.current;
}
