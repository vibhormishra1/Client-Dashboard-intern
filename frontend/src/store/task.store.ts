import { create } from 'zustand';

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
}

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
  })),
}));
