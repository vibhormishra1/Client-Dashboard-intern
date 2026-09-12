// Shared types for the Velozity frontend

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'DEVELOPER';
  isOnline?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  client?: { id: string; name: string };
  createdBy?: { id: string; name: string };
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string | null;
  projectId: string;
  project?: { id: string; name: string };
  assignedTo?: { id: string; name: string; email: string };
  createdBy?: { id: string; name: string };
}

export interface ActivityLog {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  fromStatus: string;
  toStatus: string;
  message: string;
  createdAt: string;
  user?: { id: string; name: string };
  task?: { id: string; title: string };
}

export interface Notification {
  id: string;
  recipientId: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_IN_REVIEW';
  taskId: string | null;
  isRead: boolean;
  createdAt: string;
  task?: { id: string; title: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}
