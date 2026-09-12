import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import TaskBoard from '../components/TaskBoard';
import ActivityFeed from '../components/ActivityFeed';
import api from '../api/axios';
import { useTaskStore } from '../store/task.store';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { tasks, setTasks } = useTaskStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data.data.tasks);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [setTasks]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {user?.role === 'ADMIN' ? 'Global Overview' : user?.role === 'PM' ? 'My Projects' : 'My Tasks'}
        </h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TaskBoard tasks={tasks} />
        </div>

        <div className="space-y-8">
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Activity Feed</h2>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
