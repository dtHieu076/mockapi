import { useState } from 'react';
import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { Layout } from './components/Layout';
import { EnvironmentsPage } from './pages/EnvironmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const { isAuthenticated } = useGlobalContext();
  const [currentEnvId, setCurrentEnvId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      {currentEnvId ? (
        <DashboardPage 
          envId={currentEnvId} 
          onBack={() => setCurrentEnvId(null)} 
        />
      ) : (
        <EnvironmentsPage onSelect={setCurrentEnvId} />
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
