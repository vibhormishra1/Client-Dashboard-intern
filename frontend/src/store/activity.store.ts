import { create } from 'zustand';

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

interface ActivityState {
  events: ActivityLog[];
  isLoading: boolean;
  setActivities: (events: ActivityLog[]) => void;
  addActivity: (event: ActivityLog) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],
  isLoading: false,
  setActivities: (events) => set({ events }),
  addActivity: (event) => set((state) => ({ 
    events: [event, ...state.events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })),
}));
