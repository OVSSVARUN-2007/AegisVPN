const API_BASE = 'http://localhost:4000/api/v1';

export interface VpnServer {
  id: string;
  name: string;
  country_code: string;
  country_name: string;
  city: string;
  public_ip: string;
  wireguard_endpoint: string;
  wireguard_public_key: string;
  current_load_pct: number;
  latency_ms: number;
  packet_loss_pct: number;
  is_healthy: boolean;
  active_peers_count: number;
  compositeScore?: number;
}

export interface UserDevice {
  id: string;
  name: string;
  platform: string;
  public_key: string;
  allocated_ipv4: string;
  allocated_ipv6: string;
  is_revoked: boolean;
  created_at: string;
}

export interface LeakReport {
  timestamp: string;
  clientPublicIp: string;
  detectedServer: {
    id: string;
    name: string;
    city: string;
    country: string;
    ip: string;
  } | null;
  status: {
    vpnTunnel: 'Protected' | 'Unprotected';
    ipv4State: string;
    ipv6State: string;
    dnsState: string;
    killSwitchActive: boolean;
  };
  recommendations: string[];
}

export class ApiClient {
  public static async getServers(): Promise<{ servers: VpnServer[]; totalServers: number }> {
    const res = await fetch(`${API_BASE}/servers`);
    if (!res.ok) throw new Error('Failed to fetch servers');
    return res.json();
  }

  public static async getSmartServer(): Promise<{ recommendedServer: VpnServer; score: number }> {
    const res = await fetch(`${API_BASE}/servers/smart-select`);
    if (!res.ok) throw new Error('Failed to auto-select server');
    return res.json();
  }

  public static async login(email: string, password: string): Promise<{ accessToken: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  }

  public static async getDevices(token: string): Promise<{ devices: UserDevice[] }> {
    const res = await fetch(`${API_BASE}/devices`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch devices');
    return res.json();
  }

  public static async revokeDevice(token: string, deviceId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/revoke`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to revoke device');
  }

  public static async runLeakTest(testIp?: string): Promise<LeakReport> {
    const url = testIp ? `${API_BASE}/diagnostics/leak-test?testIp=${encodeURIComponent(testIp)}` : `${API_BASE}/diagnostics/leak-test`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Diagnostic leak test failed');
    return res.json();
  }

  public static async getAuditLogs(token: string): Promise<{ auditEvents: any[] }> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }
}
