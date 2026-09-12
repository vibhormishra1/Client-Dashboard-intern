import { useEffect } from 'react';
import { useActivityStore } from '../store/activity.store';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { Activity as ActivityIcon } from 'lucide-react';

export default function ActivityFeed() {
  const { events, setActivities } = useActivityStore();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data } = await api.get('/activity?limit=20');
        setActivities(data.data.events);
      } catch (err) {
        console.error('Failed to load activity feed', err);
      }
    };
    fetchFeed();
  }, [setActivities]);

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {events.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} className="flex gap-3 text-sm">
            <div className="mt-1 bg-teal-100 p-1.5 rounded-full text-teal-600">
              <ActivityIcon className="w-3 h-3" />
            </div>
            <div>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">{event.user?.name || 'System'}</span>{' '}
                changed <span className="font-medium">{event.task?.title || 'a task'}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                  {event.fromStatus.replace('_', ' ')}
                </span>
                <span className="text-slate-400">→</span>
                <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-medium border border-teal-100">
                  {event.toStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
