import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Admin } from './pages/Admin.jsx';
import { Datasets } from './pages/Datasets.jsx';
import { DatasetExplore } from './pages/DatasetExplore.jsx';
import { DatasetDashboard } from './pages/DatasetDashboard.jsx';
import { Analyses } from './pages/Analyses.jsx';
import { PublicDashboards } from './pages/PublicDashboards.jsx';
import { Profile } from './pages/Profile.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/datasets"
            element={
              <ProtectedRoute>
                <Datasets />
              </ProtectedRoute>
            }
          />
          {/* Pas de ProtectedRoute ici : un visiteur peut consulter un dataset
              lié à une analyse publique. Le backend vérifie les droits ;
              la page affiche un message si l'accès est refusé. */}
          <Route path="/datasets/:id" element={<DatasetExplore />} />
          <Route path="/datasets/:id/dashboard" element={<DatasetDashboard />} />
          <Route
            path="/analyses"
            element={
              <ProtectedRoute>
                <Analyses />
              </ProtectedRoute>
            }
          />
          {/* Accessible au visiteur, sans connexion (CdC : dashboards publics) */}
          <Route path="/dashboards/public" element={<PublicDashboards />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
