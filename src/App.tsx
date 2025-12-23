import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Recherche } from './pages/Recherche';
import { Commerces } from './pages/Commerces';
import { FicheCommerce } from './pages/FicheCommerce';
import { Equipe } from './pages/Equipe';
import RendezVous from './pages/RendezVous';
import { Statistics } from './pages/Statistics';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCommerceId, setSelectedCommerceId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#94a3b8]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedCommerceId(null);
  };

  const handleSelectCommerce = (id: string) => {
    setSelectedCommerceId(id);
    setCurrentPage('fiche-commerce');
  };

  const renderPage = () => {
    if (currentPage === 'fiche-commerce' && selectedCommerceId) {
      return (
        <FicheCommerce
          commerceId={selectedCommerceId}
          onBack={() => handleNavigate('commerces')}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'recherche':
        return <Recherche />;
      case 'commerces':
        return (
          <Commerces
            onNavigate={handleNavigate}
            onSelectCommerce={handleSelectCommerce}
          />
        );
      case 'equipe':
        return <Equipe />;
      case 'rendez-vous':
        return <RendezVous />;
      case 'statistiques':
        return <Statistics />;
      case 'parametres':
        return (
          <div className="p-8">
            <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-12 text-center">
              <h2 className="text-2xl font-bold text-[#f1f5f9] mb-2">Paramètres</h2>
              <p className="text-[#94a3b8]">Cette fonctionnalité sera disponible prochainement</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;