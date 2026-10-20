// src/pages/Dashboard.jsx : espace analyste
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Bonjour {user?.fullName}</h1>
      <p className="text-slate-600 mb-6">Espace Data Analyst</p>
      <Link
        to="/datasets"
        className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition"
      >
        Voir mes datasets →
      </Link>
    </div>
  );
}
