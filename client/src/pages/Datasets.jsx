// src/pages/Datasets.jsx : liste des datasets + formulaire d'import CSV
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDatasets, uploadDataset } from '../api/datasets.js';

const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setDatasets(await listDatasets());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Sélectionne un fichier CSV');
      return;
    }
    setUploading(true);
    try {
      await uploadDataset({ title, description, category, source, file });
      setTitle('');
      setDescription('');
      setCategory('');
      setSource('');
      setFile(null);
      e.target.reset();
      await refresh();
    } catch (err) {
      setError(err.response?.data?.error ?? "Échec de l'import");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-[360px_1fr] gap-8">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-fit">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Importer un dataset (CSV)</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
          <input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          <input placeholder="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
          <input placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} />
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} required className="text-sm" />
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {uploading ? 'Import en cours...' : 'Importer'}
          </button>
        </form>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Mes datasets</h1>
        {loading ? (
          <p className="text-slate-500">Chargement...</p>
        ) : datasets.length === 0 ? (
          <p className="text-slate-500">Aucun dataset pour le moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {datasets.map((d) => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-slate-900">{d.title}</h3>
                {d.description && <p className="text-sm text-slate-500 mt-1">{d.description}</p>}
                <div className="flex gap-2 mt-2 text-xs text-slate-500">
                  <span className="bg-slate-100 rounded px-2 py-0.5">{d.row_count} lignes</span>
                  {d.category && <span className="bg-slate-100 rounded px-2 py-0.5">{d.category}</span>}
                </div>
                <div className="flex gap-3 mt-4 text-sm">
                  <Link to={`/datasets/${d.id}`} className="text-indigo-600 font-medium hover:underline">Explorer</Link>
                  <Link to={`/datasets/${d.id}/dashboard`} className="text-indigo-600 font-medium hover:underline">Dashboard</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
