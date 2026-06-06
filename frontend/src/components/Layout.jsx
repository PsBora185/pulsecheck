import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between p-4 transition-all duration-300 shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-8 px-2">
            <span className="text-xl md:text-2xl font-bold text-sky-400">⚡</span>
            <h2 className="text-xl font-extrabold tracking-wider hidden md:block">
              PULSE<span className="text-slate-300 font-normal">CHECK</span>
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-colors font-medium ${
                isActive('/')
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-colors font-medium ${
                isActive('/settings')
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span className="hidden md:inline">Settings</span>
            </Link>
          </nav>
        </div>

        {/* Footer Area with user profile & logout */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
          {user && (
            <div className="px-2 py-1 hidden md:block">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logged in as</p>
              <p className="text-sm font-bold text-slate-300 truncate" title={user.email}>
                {user.displayName || user.email}
              </p>
            </div>
          )}
          
          <button
            onClick={logout}
            className="flex items-center justify-center md:justify-start gap-3 p-3 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg transition-colors font-medium w-full text-left"
          >
            <span className="text-lg">🚪</span>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
