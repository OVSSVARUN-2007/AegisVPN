import React from 'react';
import { Globe, Zap, Shield, CheckCircle } from 'lucide-react';
import { useVpn } from '../context/VpnContext';
import { VpnServer } from '../api/client';

export const ServersPage: React.FC = () => {
  const { servers, activeServer, connect, connectionState } = useVpn();

  const flagEmojis: Record<string, string> = {
    IN: '🇮🇳', SG: '🇸🇬', JP: '🇯🇵', DE: '🇩🇪', NL: '🇳🇱', UK: '🇬🇧', US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺'
  };

  const handleSelectServer = (server: VpnServer) => {
    connect(server);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Global VPN Infrastructure</h1>
        <p style={{ color: 'var(--text-muted)' }}>Select from 9 high-speed, zero-log WireGuard server locations worldwide.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {servers.map(server => {
          const isSelected = activeServer?.id === server.id;
          const flag = flagEmojis[server.country_code] || '🌐';

          return (
            <div
              key={server.id}
              className={`glass-panel ${isSelected ? 'glow-connected' : ''}`}
              style={{
                padding: '24px',
                borderRadius: '16px',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>{flag}</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{server.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>IP: {server.public_ip}</span>
                  </div>
                </div>

                {isSelected && connectionState === 'Connected' ? (
                  <span className="status-badge badge-connected">
                    <CheckCircle size={14} /> Active
                  </span>
                ) : (
                  <span className="status-badge badge-connected" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                    Online
                  </span>
                )}
              </div>

              {/* Server Load & Latency Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Server Load: {server.current_load_pct}%</span>
                  <span style={{ color: 'var(--warning-amber)', fontWeight: '600' }}>
                    <Zap size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {server.latency_ms} ms
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${server.current_load_pct}%`,
                      height: '100%',
                      background: server.current_load_pct > 75 ? 'var(--danger-rose)' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleSelectServer(server)}
                className={isSelected && connectionState === 'Connected' ? 'btn-secondary' : 'btn-primary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Shield size={16} />
                {isSelected && connectionState === 'Connected' ? 'Currently Connected' : 'Connect Location'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
