// src/pages/PublicDashboards.jsx : analyses rendues publiques par leur créateur (CdC section 8)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublicAnalyses } from '../api/analyses.js';

export function PublicDashboards() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublicAnalyses().then(setAnalyses).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Dashboards publics</h1>
      <p className="text-slate-600 mb-6">Analyses rendues publiques par les autres utilisateurs de la plateforme.</p>

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : analyses.length === 0 ? (
        <p className="text-slate-500">Aucun dashboard public pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {analyses.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-slate-900">{a.title}</h3>
              <p className="text-sm text-slate-500 mt-1">
                Dataset : {a.dataset_title} — {a.config.groupBy} / {a.config.metric}
              </p>
              <p className="text-xs text-slate-400 mt-1">Par {a.owner_name}</p>
              <Link
                to={`/datasets/${a.dataset_id}/dashboard?groupBy=${a.config.groupBy}&metric=${a.config.metric}`}
                className="inline-block mt-4 text-indigo-600 font-medium text-sm hover:underline"
              >
                Voir le dashboard →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
