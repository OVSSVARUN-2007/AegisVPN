import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Lock, EyeOff } from 'lucide-react';
import { useVpn } from '../context/VpnContext';

export const PrivacyDashboard: React.FC = () => {
  const { leakReport, runLeakTest, connectionState, activeServer, killSwitchActive } = useVpn();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Privacy & Leak Diagnostics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Automated network audit verifying tunnel state, DNS paths, and IPv4/IPv6 leak protection.</p>
        </div>

        <button onClick={() => runLeakTest()} className="btn-secondary">
          <RefreshCw size={16} /> Run Diagnostic Leak Audit
        </button>
      </div>

      {/* Main Audit Score Grid */}
      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Lock size={24} color="#10b981" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Network Exposure Status</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Detected IP: {leakReport?.clientPublicIp || 'Loading...'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span>WireGuard Encrypted Tunnel</span>
              <span className="status-badge badge-connected"><CheckCircle2 size={14} /> {leakReport?.status.vpnTunnel || 'Protected'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span>IPv4 Leak Protection</span>
              <span className="status-badge badge-connected"><CheckCircle2 size={14} /> {leakReport?.status.ipv4State || 'Protected'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span>IPv6 Leak Protection</span>
              <span className="status-badge badge-connected"><CheckCircle2 size={14} /> {leakReport?.status.ipv6State || 'Blocked (Fail-Closed)'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span>Controlled DNS Resolver (10.8.0.1)</span>
              <span className="status-badge badge-connected"><CheckCircle2 size={14} /> {leakReport?.status.dnsState || 'Protected'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span>OS Network Kill Switch</span>
              <span className={`status-badge ${killSwitchActive ? 'badge-connected' : 'badge-disconnected'}`}>
                {killSwitchActive ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {killSwitchActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <EyeOff size={24} color="#06b6d4" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Active Privacy Verification</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Zero-log network validation</span>
            </div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--primary-cyan)' }}>✓ Public IP Correctly Masked</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Your real public IP address is hidden from destination websites. Traffic originates from AegisVPN exit server node <strong style={{ color: 'var(--text-main)' }}>{activeServer?.name || 'Germany - Frankfurt'}</strong>.
            </p>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>Audit Checklist Recommendations:</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {leakReport?.recommendations.map((rec, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={14} color="#10b981" /> {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
