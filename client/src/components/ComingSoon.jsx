// src/components/ComingSoon.jsx : gabarit pour les sections pas encore développées
export function ComingSoon({ title, description, items }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <span className="text-xs font-medium bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">À venir</span>
      </div>
      <p className="text-slate-600 mb-6">{description}</p>
      {items && (
        <ul className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item} className="px-4 py-3 text-sm text-slate-600">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
