// src/pages/DatasetDashboard.jsx : dashboard interactif (CdC section 7)
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getAggregate, getSummary, getTimeseries } from '../api/datasets.js';
import { saveAnalysis } from '../api/analyses.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AdvancedInsights } from '../components/AdvancedInsights.jsx';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#14b8a6', '#22c55e', '#a855f7'];
const GROUP_OPTIONS = ['region', 'country', 'category', 'sub_category', 'customer_segment'];
const METRIC_OPTIONS = ['sales', 'profit', 'quantity', 'discount'];

export function DatasetDashboard() {
  const { id } = useParams();
  const { user } = useAuth();
  // Une analyse sauvegardée ouvre ce dashboard avec ?groupBy=...&metric=... :
  // ça restaure exactement la même vue sans dupliquer les routes.
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState(searchParams.get('groupBy') || 'region');
  const [metric, setMetric] = useState(searchParams.get('metric') || 'sales');
  const [aggregate, setAggregate] = useState([]);
  const [series, setSeries] = useState([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savePublic, setSavePublic] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    getSummary(id)
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.error ?? 'Impossible de charger ce dashboard'));
  }, [id]);

  useEffect(() => {
    if (error) return;
    getAggregate(id, { groupBy, metric, agg: 'sum' }).then((d) => setAggregate(d.results)).catch(() => {});
  }, [id, groupBy, metric, error]);

  useEffect(() => {
    if (error) return;
    getTimeseries(id, { metric, agg: 'sum' }).then((d) => setSeries(d.results)).catch(() => {});
  }, [id, metric, error]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm p-6">{error}</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm mt-4 inline-block">← Retour à l'accueil</Link>
      </div>
    );
  }

  const selectClass = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  async function handleSave(e) {
    e.preventDefault();
    setSaveStatus(null);
    try {
      await saveAnalysis({
        datasetId: Number(id),
        title: saveTitle,
        config: { groupBy, metric },
        isPublic: savePublic,
      });
      setSaveStatus({ type: 'success', message: 'Analyse sauvegardée.' });
      setSaveTitle('');
      setSavePublic(false);
      setSaveOpen(false);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.response?.data?.error ?? 'Échec de la sauvegarde' });
    }
  }

  return (
    <div>
      <Link to={`/datasets/${id}`} className="text-sm text-indigo-600 hover:underline">← Exploration</Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        {user && (
          <button
            onClick={() => setSaveOpen((v) => !v)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            💾 Sauvegarder cette analyse
          </button>
        )}
      </div>

      {saveStatus && (
        <p className={`text-sm rounded-md px-3 py-2 mb-4 ${saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {saveStatus.message}
        </p>
      )}

      {user && saveOpen && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1">Titre de l'analyse</label>
            <input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              required
              placeholder={`${groupBy} / ${metric}`}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={savePublic} onChange={(e) => setSavePublic(e.target.checked)} />
            Rendre publique
          </label>
          <button type="submit" className="rounded-md bg-slate-800 px-4 py-2 text-white text-sm font-medium hover:bg-slate-900 transition">
            Enregistrer
          </button>
        </form>
      )}

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Ventes totales" value={`${summary.total_sales} $`} color="indigo" />
          <KpiCard label="Profit total" value={`${summary.total_profit} $`} color="emerald" />
          <KpiCard label="Quantité totale" value={summary.total_quantity} color="amber" />
          <KpiCard label="Commandes" value={summary.order_count} color="slate" />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Regrouper par
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className={selectClass}>
            {GROUP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Métrique
          <select value={metric} onChange={(e) => setMetric(e.target.value)} className={selectClass}>
            {METRIC_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title={`Répartition par ${groupBy}`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={aggregate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="group" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Part de ${groupBy}`}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={aggregate} dataKey="value" nameKey="group" outerRadius={100} label>
                {aggregate.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Évolution mensuelle" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={COLORS[2]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <AdvancedInsights datasetId={id} />
    </div>
  );
}

const KPI_COLORS = {
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-700',
};

function KpiCard({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${KPI_COLORS[color]}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm p-4 ${className}`}>
      <h3 className="text-sm font-medium text-slate-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}
