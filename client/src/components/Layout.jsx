// src/components/Layout.jsx : sidebar de navigation + zone de contenu
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ANALYST_LINKS = [
  { to: '/dashboard', label: 'Vue d\'ensemble', icon: '🏠' },
  { to: '/datasets', label: 'Mes datasets (import CSV)', icon: '📂' },
  { to: '/analyses', label: 'Analyses sauvegardées', icon: '💾' },
  { to: '/dashboards/public', label: 'Dashboards publics', icon: '🌐' },
  { to: '/profile', label: 'Mon profil', icon: '👤' },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Administration', icon: '⚙️' },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link to="/" className="font-semibold text-slate-800 text-lg">Sales Analytics</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/dashboards/public" className="text-slate-600 hover:text-indigo-600">🌐 Dashboards publics</Link>
              <Link to="/login" className="text-slate-600 hover:text-indigo-600">Connexion</Link>
              <Link to="/register" className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 transition">
                Créer un compte
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </div>
    );
  }

  const links = [...ANALYST_LINKS, ...(user.role === 'admin' ? ADMIN_LINKS : [])];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200">
          <Link to="/" className="font-semibold text-slate-800 text-lg">Sales Analytics</Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-200">
          <div className="px-3 text-sm text-slate-700 font-medium truncate">{user.fullName}</div>
          <div className="px-3 text-xs text-slate-400 mb-2 capitalize">{user.role}</div>
          <button
            onClick={logout}
            className="w-full rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 max-w-5xl">{children}</main>
    </div>
  );
}
