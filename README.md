# Sales Analytics Platform

Plateforme collaborative d'analyse et de visualisation de données — domaine **Ventes/Retail**.
Projet réalisé dans le cadre du module Développement Moderne (cahier des charges "Application Full Stack").

## Stack technique

- **Front-end** : React.js (Vite), React Router, Hooks, Tailwind CSS, Recharts
- **Back-end** : Node.js, Express.js, API REST
- **Base de données** : PostgreSQL (via Docker)
- **Auth** : JWT + bcrypt

## Démarrage rapide

### Prérequis
- Node.js 20+ et npm
- Docker Desktop (pour PostgreSQL)

### 1. Cloner et lancer la base de données
```bash
git clone <url-du-repo>
cd sales-analytics-platform
docker compose up -d
```
Postgres écoute sur le port **5433** (pas 5432, pour éviter les conflits avec d'autres projets).

### 2. Backend
```bash
cd server
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```
Le serveur démarre sur `http://localhost:4000`.

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
Le client démarre sur `http://localhost:5173` (ou un autre port si celui-ci est pris — Vite l'indique au démarrage).

### 4. Importer un dataset de test
Trois jeux de données sont fournis dans `server/db/seeds/` :
- `sample-superstore.csv` — 9994 lignes, ventes US (le dataset principal, compatible avec l'import actuel)
- `global-superstore.csv` — 1000 lignes, ventes internationales (colonnes proches mais pas identiques)
- `online-retail.csv` — 541909 lignes, transactions UK réelles (⚠️ structure différente, pas encore compatible avec l'import)

Crée un compte sur la plateforme, puis importe `sample-superstore.csv` depuis la page "Mes datasets".

## Comptes de test existants

| Email | Mot de passe | Rôle |
|---|---|---|
| ilham@test.com | password123 | analyst |
| admin@test.com | password123 | admin |

## Fonctionnalités implémentées (CdC)

- [x] 3 niveaux d'accès : visiteur, analyst, admin
- [x] Authentification (JWT, mots de passe hashés avec bcrypt)
- [x] Import de dataset CSV (titre, description, catégorie, source)
- [x] Exploration : tableau avec recherche/filtre/tri/pagination, stats automatiques (valeurs manquantes, moyenne/min/max/écart-type)
- [x] Analyse : agrégations (sommes, répartitions, classements), évolution temporelle
- [x] Dashboard interactif : KPI, graphiques (barres, camembert, courbe), filtres dynamiques
- [x] Analyses sauvegardées (privées ou publiques)
- [x] Dashboards publics consultables **sans connexion** (visiteur)
- [x] Espace admin : liste des utilisateurs, changement de rôle, supervision des datasets, indicateurs globaux
- [ ] Fonctionnalités avancées (détection d'outliers, corrélation, score de qualité des données) — à faire
- [ ] Import flexible multi-format CSV (Global Superstore, Online Retail) — à faire

## Architecture

```
sales-analytics-platform/
├── docker-compose.yml       # PostgreSQL
├── server/
│   ├── db/
│   │   ├── migrations/      # schéma SQL
│   │   └── seeds/           # datasets de test (CSV)
│   └── src/
│       ├── config/          # connexion DB
│       ├── routes/          # définition des endpoints
│       ├── controllers/     # logique métier
│       └── middleware/      # auth, rôles, accès dataset
└── client/
    └── src/
        ├── api/             # appels HTTP vers le backend
        ├── context/         # état d'authentification global
        ├── components/      # Layout (sidebar), ProtectedRoute
        └── pages/           # une page par écran
```

## Notes pour l'équipe

- Le port Postgres est **5433** (pas le défaut 5432) pour éviter les conflits avec d'autres projets sur la même machine.
- Chaque dataset est isolé par utilisateur (`owner_id`) — un dataset n'est visible par un autre utilisateur que si une de ses analyses est marquée publique.
- `server/.env.example` et `client/.env` donnent la config par défaut ; adapte `DATABASE_URL` si ton port Postgres diffère.

