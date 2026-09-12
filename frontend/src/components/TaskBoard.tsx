import type { Task } from '../store/task.store';
import { useTaskStore } from '../store/task.store';
import { useAuthStore } from '../store/auth.store';
import { AlertCircle, Clock, CheckCircle2, PlayCircle, MoreHorizontal } from 'lucide-react';
import api from '../api/axios';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'TO_DO', title: 'To Do', icon: Clock, color: 'text-slate-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', icon: AlertCircle, color: 'text-purple-500' },
  { id: 'DONE', title: 'Done', icon: CheckCircle2, color: 'text-teal-500' },
  { id: 'OVERDUE', title: 'Overdue', icon: AlertCircle, color: 'text-red-500' },
] as const;

export default function TaskBoard({ tasks }: { tasks: Task[] }) {
  const { updateTaskStatus } = useTaskStore();
  const { user } = useAuthStore();

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      updateTaskStatus(taskId, newStatus);
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        const Icon = col.icon;

        return (
          <div key={col.id} className="bg-slate-100 rounded-lg p-4 min-h-[500px]">
            <div className="flex items-center gap-2 mb-4 font-semibold text-slate-700">
              <Icon className={`w-5 h-5 ${col.color}`} />
              {col.title}
              <span className="ml-auto bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnTasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-md shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900 text-sm">{task.title}</h3>

                    <div className="relative inline-block text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <select
                        className="opacity-0 absolute inset-0 cursor-pointer w-full"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        disabled={user?.role === 'DEVELOPER' && task.assignedTo?.id !== user.id}
                      >
                        {COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                    <span className="font-medium text-slate-700 truncate max-w-[100px]">
                      {task.project?.name}
                    </span>
                    {task.dueDate && (
                      <span className={task.status === 'OVERDUE' ? 'text-red-500 font-semibold' : ''}>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
