export const ROLES = {
  ADMIN: 'ADMIN',
  PM: 'PM',
  DEVELOPER: 'DEVELOPER',
} as const;

export const TASK_STATUS = {
  TO_DO: 'TO_DO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  OVERDUE: 'OVERDUE',
} as const;

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
} as const;

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_IN_REVIEW: 'TASK_IN_REVIEW',
} as const;

export const SOCKET_EVENTS = {
  AUTH: 'auth',
  JOIN_PROJECT: 'join-project',
  LEAVE_PROJECT: 'leave-project',
  CATCH_UP: 'catch-up',
  CATCH_UP_EVENTS: 'catch-up:events',
  CATCH_UP_ERROR: 'catch-up:error',
  ACTIVITY_NEW: 'activity:new',
  TASK_UPDATED: 'task:updated',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_COUNT: 'notification:count',
  PRESENCE_UPDATE: 'presence:update',
  DISCONNECT: 'disconnect',
  CONNECTION: 'connection'
} as const;
