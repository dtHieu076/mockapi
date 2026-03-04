import { useState } from 'react';
import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { Layout } from './components/Layout';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DatabasePage } from './pages/DatabasePage';
import { LoginPage } from './pages/LoginPage';

type MainView = 'subdomains' | 'databases';

function AppContent() {
  const { isAuthenticated, setSelectedEnvironment } = useGlobalContext();
  const [currentEnvId, setCurrentEnvId] = useState<string | null>(null);
  const [mainView, setMainView] = useState<MainView>('subdomains');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleBackToMain = () => {
    setCurrentEnvId(null);
    setSelectedEnvironment(null);
  };

  const handleGoToDatabases = () => {
    setCurrentEnvId(null);
    setMainView('databases');
  };

  const handleGoToSubdomains = () => {
    setCurrentEnvId(null);
    setMainView('subdomains');
  };

  return (
    <Layout
      currentView={mainView}
      onViewChange={mainView === 'subdomains' ? handleGoToDatabases : handleGoToSubdomains}
    >
      {currentEnvId ? (
        <DashboardPage
          envId={currentEnvId}
          onBack={handleBackToMain}
        />
      ) : mainView === 'subdomains' ? (
        <EnvironmentsPage onSelect={setCurrentEnvId} />
      ) : (
        <DatabasePage onBack={handleBackToMain} />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
}
