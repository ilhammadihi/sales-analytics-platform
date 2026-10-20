// src/pages/DatasetExplore.jsx : exploration d'un dataset (CdC section 5)
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDatasetStats, listRecords } from '../api/datasets.js';
import { useAuth } from '../context/AuthContext.jsx';

const COLUMNS = ['order_date', 'region', 'category', 'sub_category', 'product_name', 'sales', 'quantity', 'discount', 'profit'];

export function DatasetExplore() {
  const { id } = useParams();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('order_date');
  const [sortDir, setSortDir] = useState('desc');
  const limit = 20;

  useEffect(() => {
    getDatasetStats(id)
      .then(setStats)
      .catch((err) => setError(err.response?.data?.error ?? 'Impossible de charger ce dataset'));
  }, [id]);

  useEffect(() => {
    if (error) return;
    listRecords(id, { page, limit, q: q || undefined, category: category || undefined, sortBy, sortDir })
      .then(setData)
      .catch(() => {});
  }, [id, page, q, category, sortBy, sortDir, error]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm p-6">{error}</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm mt-4 inline-block">← Retour à l'accueil</Link>
      </div>
    );
  }

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  const totalPages = Math.max(1, Math.ceil(data.total / limit));

  return (
    <div>
      {user && <Link to="/datasets" className="text-sm text-indigo-600 hover:underline">← Mes datasets</Link>}

      {stats && (
        <>
          <div className="flex items-center justify-between mt-2 mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">{stats.dataset.title}</h1>
            <Link
              to={`/datasets/${id}/dashboard`}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Voir le dashboard →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Lignes" value={stats.dataset.rowCount} />
            <StatCard label="Colonnes" value={stats.dataset.columnCount} />
            <StatCard label="Ventes moyennes" value={`${stats.stats.sales_avg} $`} />
            <StatCard label="Profit moyen" value={`${stats.stats.profit_avg} $`} />
            <StatCard label="Ventes min / max" value={`${stats.stats.sales_min} / ${stats.stats.sales_max}`} />
            <StatCard label="Profit min / max" value={`${stats.stats.profit_min} / ${stats.stats.profit_max}`} />
            <StatCard label="Écart-type ventes" value={stats.stats.sales_stddev} />
            <StatCard label="Valeurs manquantes (région)" value={stats.stats.missing_region} />
          </div>
        </>
      )}

      <div className="flex gap-3 mb-3">
        <input
          placeholder="Rechercher un produit..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          placeholder="Catégorie exacte..."
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="text-left px-4 py-2 font-medium text-slate-600 cursor-pointer select-none hover:text-indigo-600"
                >
                  {col}{sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-2">{r.order_date}</td>
                <td className="px-4 py-2">{r.region}</td>
                <td className="px-4 py-2">{r.category}</td>
                <td className="px-4 py-2">{r.sub_category}</td>
                <td className="px-4 py-2 max-w-xs truncate">{r.product_name}</td>
                <td className="px-4 py-2">{r.sales}</td>
                <td className="px-4 py-2">{r.quantity}</td>
                <td className="px-4 py-2">{r.discount}</td>
                <td className={`px-4 py-2 ${Number(r.profit) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{r.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50"
        >
          Précédent
        </button>
        <span className="text-slate-600">Page {page} / {totalPages} ({data.total} lignes)</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50"
        >
          Suivant
        </button>
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
