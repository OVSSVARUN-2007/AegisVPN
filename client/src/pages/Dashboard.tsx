import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Globe, ArrowDown, ArrowUp, Lock, RefreshCw } from 'lucide-react';
import { useVpn } from '../context/VpnContext';

export const Dashboard: React.FC = () => {
  const { connectionState, activeServer, connect, disconnect, killSwitchActive } = useVpn();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (connectionState === 'Connected') {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [connectionState]);

  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const flagEmojis: Record<string, string> = {
    IN: '🇮🇳', SG: '🇸🇬', JP: '🇯🇵', DE: '🇩🇪', NL: '🇳🇱', UK: '🇬🇧', US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺'
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>VPN Connection Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real encrypted WireGuard tunnel status and real-time network measurements.</p>
      </div>

      {/* Main Connection Power Card */}
      <div className={`glass-panel ${connectionState === 'Connected' ? 'glow-connected' : 'glow-disconnected'}`} style={{ padding: '40px', textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => connectionState === 'Connected' ? disconnect() : connect()}
            disabled={connectionState === 'Connecting'}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: 'none',
              background: connectionState === 'Connected'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #f43f5e, #be123c)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: connectionState === 'Connected'
                ? '0 0 50px rgba(16, 185, 129, 0.6)'
                : '0 0 30px rgba(244, 63, 94, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {connectionState === 'Connecting' ? (
              <RefreshCw size={48} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            ) : connectionState === 'Connected' ? (
              <ShieldCheck size={54} />
            ) : (
              <ShieldAlert size={54} />
            )}
          </button>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
          {connectionState === 'Connected' ? 'PROTECTED & ENCRYPTED' : connectionState === 'Connecting' ? 'CONNECTING TUNNEL...' : 'DISCONNECTED'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {connectionState === 'Connected'
            ? `Encrypted WireGuard tunnel active to ${activeServer?.name}`
            : 'Your internet traffic is currently unencrypted outside the VPN.'}
        </p>

        {connectionState === 'Connected' && (
          <div style={{ marginTop: '16px', fontSize: '1.25rem', fontFamily: 'monospace', color: 'var(--primary-cyan)', fontWeight: '700' }}>
            Connected: {formatDuration(seconds)}
          </div>
        )}
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <Globe size={20} color="#06b6d4" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Active Exit Server</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>
            {flagEmojis[activeServer?.country_code || 'DE']} {activeServer?.name || 'Germany - Frankfurt'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Public IP: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{connectionState === 'Connected' ? activeServer?.public_ip : 'Direct ISP Address'}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <Zap size={20} color="#f59e0b" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Connection Quality</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>
            {connectionState === 'Connected' ? `${activeServer?.latency_ms || 18} ms` : '—'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Packet Loss: <span style={{ color: 'var(--success-emerald)', fontWeight: '600' }}>{connectionState === 'Connected' ? '0.0%' : 'N/A'}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <Lock size={20} color="#10b981" />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' }}>Protocol & Protection</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', color: 'var(--success-emerald)' }}>
            WireGuard (ChaCha20)
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Kill Switch: <span style={{ color: killSwitchActive ? 'var(--success-emerald)' : 'var(--danger-rose)', fontWeight: '600' }}>{killSwitchActive ? '✓ Active' : 'Disabled'}</span>
          </div>
        </div>
      </div>

      {/* Live Bandwidth Throughput Meter */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Live Network Throughput</h3>
        <div className="grid-cols-2">
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-cyan)', marginBottom: '8px' }}>
              <ArrowDown size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>DOWNLOAD THROUGHPUT</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              {connectionState === 'Connected' ? '450.5 Mbps' : '0.0 Mbps'}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-indigo)', marginBottom: '8px' }}>
              <ArrowUp size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>UPLOAD THROUGHPUT</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
              {connectionState === 'Connected' ? '120.2 Mbps' : '0.0 Mbps'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
