import React from 'react';
import { Settings, Shield, Globe, Lock, Cpu } from 'lucide-react';
import { useVpn } from '../context/VpnContext';

export const SettingsPage: React.FC = () => {
  const { killSwitchActive, toggleKillSwitch } = useVpn();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Application Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure WireGuard tunnel policies, network kill switch, and startup behavior.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
        {/* Kill Switch Toggle Option */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Shield size={24} color="#10b981" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>OS Network Kill Switch</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Block all non-VPN internet traffic at the OS firewall level if the tunnel drops unexpectedly.
              </p>
            </div>
          </div>

          <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={killSwitchActive}
              onChange={e => toggleKillSwitch(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', inset: 0,
              backgroundColor: killSwitchActive ? '#10b981' : '#334155',
              borderRadius: '28px', transition: 'all 0.3s'
            }}>
              <span style={{
                position: 'absolute', left: killSwitchActive ? '26px' : '4px', top: '4px',
                width: '20px', height: '20px', backgroundColor: '#ffffff', borderRadius: '50%', transition: 'all 0.3s'
              }} />
            </span>
          </label>
        </div>

        {/* DNS Configuration Option */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Globe size={24} color="#06b6d4" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>DNS Resolver Mode</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Route all DNS requests through controlled AegisVPN encrypted resolver (10.8.0.1).
              </p>
            </div>
          </div>

          <span className="status-badge badge-connected">Enforced (10.8.0.1)</span>
        </div>

        {/* Auto-Connect on System Startup Option */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Cpu size={24} color="#6366f1" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Auto-Connect on Launch</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Automatically establish VPN tunnel to the fastest server upon system boot.
              </p>
            </div>
          </div>

          <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', inset: 0, backgroundColor: '#6366f1', borderRadius: '28px' }}>
              <span style={{ position: 'absolute', left: '26px', top: '4px', width: '20px', height: '20px', backgroundColor: '#ffffff', borderRadius: '50%' }} />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
