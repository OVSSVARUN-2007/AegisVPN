import React from 'react';
import { Shield, Server, Lock, Laptop, Settings, HelpCircle, UserCheck } from 'lucide-react';
import { useVpn } from '../context/VpnContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { connectionState, activeServer, user } = useVpn();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'servers', label: 'VPN Servers', icon: Server },
    { id: 'privacy', label: 'Privacy Diagnostics', icon: Lock },
    { id: 'devices', label: 'Devices', icon: Laptop },
    { id: 'admin', label: 'Admin RBAC', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Transparency & Help', icon: HelpCircle },
  ];

  return (
    <div className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
        }}>
          <Shield size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>AegisVPN</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Zero-Trust Platform
          </span>
        </div>
      </div>

      {/* Connection Indicator Widget */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</span>
          <span className={`status-badge ${connectionState === 'Connected' ? 'badge-connected' : 'badge-disconnected'}`}>
            <span className="pulse-dot" />
            {connectionState}
          </span>
        </div>
        {connectionState === 'Connected' && activeServer && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: '600' }}>{activeServer.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>IP: {activeServer.public_ip}</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid var(--primary-indigo)' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#6366f1' : '#94a3b8'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.email}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>Role: {user.roles?.join(', ')}</div>
        </div>
      )}
    </div>
  );
};
