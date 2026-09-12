import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { LogOut, Activity } from 'lucide-react';
import api from '../api/axios';
import NotificationsPopover from '../components/NotificationsPopover';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-teal-600 mr-2" />
              <span className="font-bold text-xl text-slate-800 tracking-tight">Velozity</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationsPopover />
              <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
