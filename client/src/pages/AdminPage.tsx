import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, Plus, Server, FileText } from 'lucide-react';
import { useVpn } from '../context/VpnContext';
import { ApiClient } from '../api/client';

export const AdminPage: React.FC = () => {
  const { token, user } = useVpn();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      ApiClient.getAuditLogs(token).then(res => setAuditLogs(res.auditEvents)).catch(() => {});
    }
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Admin Control & RBAC Panel</h1>
        <p style={{ color: 'var(--text-muted)' }}>Role-Based Access Control, infrastructure provisioning, and security audit event inspector.</p>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <UserCheck size={24} color="#6366f1" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Active Account Permissions</h3>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <div>Current Email: <strong style={{ color: 'var(--text-main)' }}>{user?.email}</strong></div>
            <div>Assigned RBAC Role: <strong style={{ color: 'var(--primary-cyan)' }}>{user?.roles?.join(', ')}</strong></div>
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Permissions include user role elevation, server node registration, and security log inspection.
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Server size={24} color="#06b6d4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Infrastructure Provisioner</h3>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Plus size={16} /> Register New Server Node
          </button>
        </div>
      </div>

      {/* Security Audit Log Inspector */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <FileText size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Security Audit Event Logs</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px' }}>ACTION</th>
                <th style={{ padding: '10px' }}>TARGET TYPE</th>
                <th style={{ padding: '10px' }}>TARGET ID</th>
                <th style={{ padding: '10px' }}>CHANGES</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>{log.created_at}</td>
                  <td style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--primary-cyan)' }}>{log.action}</td>
                  <td style={{ padding: '12px 10px' }}>{log.target_type}</td>
                  <td style={{ padding: '12px 10px', fontFamily: 'monospace' }}>{log.target_id}</td>
                  <td style={{ padding: '12px 10px' }}>{log.changes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
