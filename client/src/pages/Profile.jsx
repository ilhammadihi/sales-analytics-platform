// src/pages/Profile.jsx : gestion du profil utilisateur (CdC section 3 — "gérer son profil")
import { useAuth } from '../context/AuthContext.jsx';

export function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Mon profil</h1>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-md space-y-3">
        <Field label="Nom complet" value={user?.fullName} />
        <Field label="Email" value={user?.email} />
        <Field label="Rôle" value={user?.role} />
      </div>
      <p className="text-xs text-slate-400 mt-3">La modification du profil (nom, mot de passe) sera ajoutée prochainement.</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-900 capitalize">{value}</div>
    </div>
  );
}
