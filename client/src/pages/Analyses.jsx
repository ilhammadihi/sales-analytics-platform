// src/pages/Analyses.jsx : analyses sauvegardées (CdC section 8)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAnalysis, listMyAnalyses } from '../api/analyses.js';

export function Analyses() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    listMyAnalyses().then(setAnalyses).finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleDelete(id) {
    await deleteAnalysis(id);
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Analyses sauvegardées</h1>
      <p className="text-slate-600 mb-6">
        Tes analyses enregistrées (dataset + regroupement + métrique), privées ou partagées.
        Sauvegarde-en une depuis le dashboard d'un dataset.
      </p>

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : analyses.length === 0 ? (
        <p className="text-slate-500">Aucune analyse sauvegardée pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {analyses.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                {a.is_public && (
                  <span className="text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">Publique</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Dataset : {a.dataset_title} — {a.config.groupBy} / {a.config.metric}
              </p>
              <div className="flex gap-3 mt-4 text-sm">
                <Link
                  to={`/datasets/${a.dataset_id}/dashboard?groupBy=${a.config.groupBy}&metric=${a.config.metric}`}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Rouvrir
                </Link>
                <button onClick={() => handleDelete(a.id)} className="text-red-600 font-medium hover:underline">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
