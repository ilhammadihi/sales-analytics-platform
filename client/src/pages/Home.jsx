// src/pages/Home.jsx : page d'accueil (visiteur) — présentation de la plateforme
// Les boutons de connexion/inscription sont dans l'en-tête (Layout.jsx) uniquement,
// pour éviter de les dupliquer ici.
export function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Sales Analytics Platform</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
        Centralisez, explorez, analysez et visualisez vos données de ventes grâce à des
        tableaux de bord interactifs.
      </p>
    </div>
  );
}
