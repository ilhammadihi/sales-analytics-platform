// src/pages/Admin.jsx : espace administrateur (CdC section 10)
import { useEffect, useState } from 'react';
import { getPlatformStats, listAllDatasets, listUsers, updateUserRole } from '../api/admin.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Admin() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState(null);

  function refreshUsers() {
    listUsers().then(setUsers);
  }

  useEffect(() => {
    getPlatformStats().then(setStats);
    refreshUsers();
    listAllDatasets().then(setDatasets);
  }, []);

  async function handleRoleChange(id, role) {
    setError(null);
    try {
      await updateUserRole(id, role);
      refreshUsers();
    } catch (err) {
      setError(err.response?.data?.error ?? 'Échec du changement de rôle');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Administration</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Utilisateurs" value={stats.users.total} />
          <StatCard label="dont admins" value={stats.users.admins} />
          <StatCard label="Datasets" value={stats.datasets.total} />
          <StatCard label="Lignes de données" value={stats.totalRows} />
          <StatCard label="Analyses sauvegardées" value={stats.analyses.total} />
          <StatCard label="dont publiques" value={stats.analyses.public_count} />
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mb-4">{error}</p>}

      <h2 className="text-lg font-semibold text-slate-900 mb-3">Utilisateurs</h2>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Nom</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Rôle</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Datasets</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{u.full_name}</td>
                <td className="px-4 py-2 text-slate-500">{u.email}</td>
                <td className="px-4 py-2">
                  {u.id === currentUser.id ? (
                    <span className="text-xs text-slate-400">{u.role} (toi)</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="analyst">analyst</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-2">{u.dataset_count}</td>
                <td className="px-4 py-2 text-slate-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-3">Tous les datasets de la plateforme</h2>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Titre</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Propriétaire</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Catégorie</th>
              <th className="text-left px-4 py-2 font-medium text-slate-600">Lignes</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{d.title}</td>
                <td className="px-4 py-2 text-slate-500">{d.owner_name}</td>
                <td className="px-4 py-2">{d.category}</td>
                <td className="px-4 py-2">{d.row_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
