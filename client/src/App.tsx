import React, { useState } from 'react';
import { VpnProvider } from './context/VpnContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ServersPage } from './pages/ServersPage';
import { PrivacyDashboard } from './pages/PrivacyDashboard';
import { DevicesPage } from './pages/DevicesPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPrivacyPage } from './pages/HelpPrivacyPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'servers': return <ServersPage />;
      case 'privacy': return <PrivacyDashboard />;
      case 'devices': return <DevicesPage />;
      case 'admin': return <AdminPage />;
      case 'settings': return <SettingsPage />;
      case 'help': return <HelpPrivacyPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <VpnProvider>
      <AppContent />
    </VpnProvider>
  );
};

export default App;
