// src/components/AdvancedInsights.jsx : les 3 fonctionnalités avancées (CdC section 9)
import { useEffect, useState } from 'react';
import { getCorrelation, getOutliers, getQualityScore } from '../api/insights.js';

const METRIC_OPTIONS = ['sales', 'profit', 'quantity', 'discount'];

export function AdvancedInsights({ datasetId }) {
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Fonctionnalités avancées</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        <QualityCard datasetId={datasetId} />
        <CorrelationCard datasetId={datasetId} />
        <OutliersCard datasetId={datasetId} />
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function QualityCard({ datasetId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getQualityScore(datasetId).then(setData).catch(() => {});
  }, [datasetId]);

  if (!data) return <Card title="📊 Score de qualité des données"><p className="text-sm text-slate-400">Chargement...</p></Card>;

  const scoreColor = data.score >= 90 ? 'text-emerald-600' : data.score >= 70 ? 'text-amber-600' : 'text-red-600';

  return (
    <Card title="📊 Score de qualité des données">
      <div className={`text-4xl font-bold mb-3 ${scoreColor}`}>{data.score}/100</div>
      <p className="text-xs text-slate-500 mb-2">Taux de valeurs manquantes par colonne :</p>
      <ul className="space-y-1 text-sm">
        {data.columns.map((c) => (
          <li key={c.column} className="flex justify-between">
            <span className="text-slate-600">{c.column}</span>
            <span className={c.missingRate > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}>
              {c.missingRate}% ({c.missing})
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CorrelationCard({ datasetId }) {
  const [x, setX] = useState('discount');
  const [y, setY] = useState('profit');
  const [result, setResult] = useState(null);

  useEffect(() => {
    getCorrelation(datasetId, x, y).then(setResult).catch(() => {});
  }, [datasetId, x, y]);

  const selectClass = 'rounded-md border border-slate-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <Card title="🔗 Analyse de corrélation">
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
        <select value={x} onChange={(e) => setX(e.target.value)} className={selectClass}>
          {METRIC_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        vs
        <select value={y} onChange={(e) => setY(e.target.value)} className={selectClass}>
          {METRIC_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {result && (
        <div>
          <div className="text-3xl font-bold text-slate-900">{result.coefficient}</div>
          <p className="text-sm text-slate-500 mt-1">
            Corrélation <span className="font-medium">{result.strength}</span>
            {result.coefficient > 0 ? ' positive' : result.coefficient < 0 ? ' négative' : ''}
            {' '}entre {x} et {y} (coefficient de Pearson, de -1 à 1).
          </p>
        </div>
      )}
    </Card>
  );
}

function OutliersCard({ datasetId }) {
  const [column, setColumn] = useState('profit');
  const [result, setResult] = useState(null);

  useEffect(() => {
    getOutliers(datasetId, column).then(setResult).catch(() => {});
  }, [datasetId, column]);

  const selectClass = 'rounded-md border border-slate-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <Card title="⚠️ Détection de valeurs aberrantes (méthode IQR)">
      <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
        Colonne :
        <select value={column} onChange={(e) => setColumn(e.target.value)} className={selectClass}>
          {METRIC_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {result && (
        <>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-semibold text-red-600">{result.totalOutliers}</span> ligne(s) hors de l'intervalle normal
            [{Number(result.lowerBound).toFixed(2)} ; {Number(result.upperBound).toFixed(2)}]
          </p>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="text-left py-1">Produit</th>
                  <th className="text-right py-1">{column}</th>
                </tr>
              </thead>
              <tbody>
                {result.sample.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-1 max-w-[180px] truncate">{r.product_name}</td>
                    <td className="py-1 text-right font-medium">{r[column]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
