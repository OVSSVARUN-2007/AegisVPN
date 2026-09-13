import React, { useState } from 'react';
import { Laptop, Trash2, Key, Plus, ShieldCheck } from 'lucide-react';
import { useVpn } from '../context/VpnContext';

export const DevicesPage: React.FC = () => {
  const { devices, revokeDevice } = useVpn();
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);

  const handleRevoke = async (deviceId: string) => {
    await revokeDevice(deviceId);
    setShowRevokeModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Authorized Devices</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage Curve25519 WireGuard public key pairs and revoke active device permissions.</p>
        </div>

        <button className="btn-primary">
          <Plus size={16} /> Register New Device
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>DEVICE NAME</th>
              <th style={{ padding: '12px' }}>PLATFORM</th>
              <th style={{ padding: '12px' }}>WIRE GUARD PUBLIC KEY</th>
              <th style={{ padding: '12px' }}>TUNNEL IP (IPV4 / IPV6)</th>
              <th style={{ padding: '12px' }}>STATUS</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <tr key={device.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <td style={{ padding: '16px 12px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Laptop size={16} color="#6366f1" /> {device.name}
                  </div>
                </td>
                <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{device.platform}</td>
                <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--primary-cyan)' }}>
                  {device.public_key.substring(0, 16)}...
                </td>
                <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {device.allocated_ipv4}
                </td>
                <td style={{ padding: '16px 12px' }}>
                  {device.is_revoked ? (
                    <span className="status-badge badge-disconnected">Revoked</span>
                  ) : (
                    <span className="status-badge badge-connected">
                      <ShieldCheck size={12} /> Active
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  {!device.is_revoked && (
                    <button
                      onClick={() => setShowRevokeModal(device.id)}
                      className="btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Trash2 size={14} /> Revoke Access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revoke Confirmation Dialog */}
      {showRevokeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '420px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px' }}>Revoke Device Access?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Revoking this device will instantly delete its public key from all active VPN server nodes and terminate active WireGuard tunnels.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowRevokeModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleRevoke(showRevokeModal)} className="btn-danger">Confirm Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
