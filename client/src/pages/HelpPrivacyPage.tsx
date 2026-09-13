import React from 'react';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2, XCircle } from 'lucide-react';

export const HelpPrivacyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Transparency & Privacy Guide</h1>
        <p style={{ color: 'var(--text-muted)' }}>Honest, accurate technical information about how AegisVPN protects your privacy and what it cannot guarantee.</p>
      </div>

      {/* Grid: What AegisVPN Protects vs What it Does NOT Protect */}
      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '28px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--success-emerald)' }}>
            <ShieldCheck size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>What AegisVPN Protects</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Hides your Real Public IP</strong>: Visited websites see the AegisVPN exit server IP address instead of your location.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Encrypts Internet Transit</strong>: All IP packets are encrypted using modern ChaCha20-Poly1305 WireGuard ciphers.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Blocks ISP Eavesdropping</strong>: Your ISP cannot see the domains or HTTP contents you browse.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Prevents DNS Leaks</strong>: DNS queries resolve inside the encrypted WireGuard tunnel at 10.8.0.1.</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '28px', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--danger-rose)' }}>
            <ShieldAlert size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>What AegisVPN Does NOT Protect</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>No "100% Anonymity"</strong>: Signing into personal web accounts (e.g. Google, Facebook) reveals your identity to those services.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Browser Tracking & Fingerprinting</strong>: Cookies, canvas fingerprinting, and browser sessions operate above the VPN layer.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Host Compromise / Malware</strong>: Trojan viruses or keyloggers on your PC operate independently of network transit.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* No-Log Data Policy Section */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Zero-Log Commitment</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
          AegisVPN does <strong>NOT</strong> collect, store, or log browsing history, destination URLs, DNS query logs, HTTP payloads, or connection IP timestamps.
        </p>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          To verify your active WireGuard connection state at any time, run <code>aegisvpn status</code> in your terminal or use our Privacy Diagnostics tab.
        </div>
      </div>
    </div>
  );
};
