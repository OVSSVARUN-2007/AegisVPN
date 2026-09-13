import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  id: string;
  name: string;
  description: string;
}

export interface UserRoleRow {
  user_id: string;
  role_id: string;
}

export interface VpnServerRow {
  id: string;
  name: string;
  country_code: string;
  country_name: string;
  city: string;
  public_ip: string;
  wireguard_endpoint: string;
  wireguard_public_key: string;
  wireguard_port: number;
  capacity_mbps: number;
  current_load_pct: number;
  latency_ms: number;
  packet_loss_pct: number;
  is_healthy: boolean;
  active_peers_count: number;
  version: string;
  last_health_check: string;
  created_at: string;
}

export interface DeviceRow {
  id: string;
  user_id: string;
  name: string;
  platform: string;
  public_key: string;
  allocated_ipv4: string;
  allocated_ipv6: string;
  is_revoked: boolean;
  last_connection?: string;
  last_handshake?: string;
  current_server_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VpnPeerRow {
  id: string;
  device_id: string;
  server_id: string;
  public_key: string;
  allowed_ips: string;
  preshared_key?: string;
  is_active: boolean;
  created_at: string;
}

export interface SecurityEventRow {
  id: string;
  user_id?: string;
  event_type: string;
  severity: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface AuditEventRow {
  id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  changes: string;
  created_at: string;
}

// In-Memory Production-Grade Relational Database Engine for AegisVPN Control Plane
class AegisDatabase {
  public users: Map<string, UserRow> = new Map();
  public roles: Map<string, RoleRow> = new Map();
  public userRoles: UserRoleRow[] = [];
  public servers: Map<string, VpnServerRow> = new Map();
  public devices: Map<string, DeviceRow> = new Map();
  public peers: Map<string, VpnPeerRow> = new Map();
  public securityEvents: SecurityEventRow[] = [];
  public auditEvents: AuditEventRow[] = [];
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Seed Roles
    const roleNames = ['User', 'Support', 'NetworkOperator', 'SecurityOperator', 'Admin', 'SuperAdmin'];
    for (const name of roleNames) {
      const roleId = `role-${name.toLowerCase()}`;
      this.roles.set(roleId, {
        id: roleId,
        name,
        description: `${name} access role`
      });
    }

    // 2. Seed Default Admin User
    const adminPasswordHash = await argon2.hash('AdminPass123!', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    });
    const adminId = 'user-admin-01';
    this.users.set(adminId, {
      id: adminId,
      email: 'admin@aegisvpn.com',
      password_hash: adminPasswordHash,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const superAdminRole = Array.from(this.roles.values()).find(r => r.name === 'SuperAdmin');
    if (superAdminRole) {
      this.userRoles.push({ user_id: adminId, role_id: superAdminRole.id });
    }

    // 3. Seed Default VPN Servers (9 Global Locations)
    const initialServers: Partial<VpnServerRow>[] = [
      {
        name: 'India - Mumbai 01',
        country_code: 'IN',
        country_name: 'India',
        city: 'Mumbai',
        public_ip: '13.127.45.10',
        wireguard_endpoint: '13.127.45.10:51820',
        wireguard_public_key: 'IN1ServerPubKeyBase64KeyAegisVPNMumbai01=',
        latency_ms: 15,
        current_load_pct: 12
      },
      {
        name: 'Singapore 01',
        country_code: 'SG',
        country_name: 'Singapore',
        city: 'Singapore',
        public_ip: '128.199.200.15',
        wireguard_endpoint: '128.199.200.15:51820',
        wireguard_public_key: 'SG1ServerPubKeyBase64KeyAegisVPNSingapore=',
        latency_ms: 32,
        current_load_pct: 25
      },
      {
        name: 'Japan - Tokyo 01',
        country_code: 'JP',
        country_name: 'Japan',
        city: 'Tokyo',
        public_ip: '139.59.220.30',
        wireguard_endpoint: '139.59.220.30:51820',
        wireguard_public_key: 'JP1ServerPubKeyBase64KeyAegisVPNTokyo01==',
        latency_ms: 70,
        current_load_pct: 18
      },
      {
        name: 'Germany - Frankfurt 01',
        country_code: 'DE',
        country_name: 'Germany',
        city: 'Frankfurt',
        public_ip: '159.69.100.40',
        wireguard_endpoint: '159.69.100.40:51820',
        wireguard_public_key: 'DE1ServerPubKeyBase64KeyAegisVPNFrankfurt=',
        latency_ms: 110,
        current_load_pct: 35
      },
      {
        name: 'Netherlands - Amsterdam 01',
        country_code: 'NL',
        country_name: 'Netherlands',
        city: 'Amsterdam',
        public_ip: '188.166.50.50',
        wireguard_endpoint: '188.166.50.50:51820',
        wireguard_public_key: 'NL1ServerPubKeyBase64KeyAegisVPNAmsterdam=',
        latency_ms: 105,
        current_load_pct: 22
      },
      {
        name: 'United Kingdom - London 01',
        country_code: 'UK',
        country_name: 'United Kingdom',
        city: 'London',
        public_ip: '178.128.80.60',
        wireguard_endpoint: '178.128.80.60:51820',
        wireguard_public_key: 'UK1ServerPubKeyBase64KeyAegisVPNLondon01=',
        latency_ms: 120,
        current_load_pct: 40
      },
      {
        name: 'United States - New York 01',
        country_code: 'US',
        country_name: 'United States',
        city: 'New York',
        public_ip: '104.248.90.70',
        wireguard_endpoint: '104.248.90.70:51820',
        wireguard_public_key: 'US1ServerPubKeyBase64KeyAegisVPNNewYork01=',
        latency_ms: 180,
        current_load_pct: 48
      },
      {
        name: 'Canada - Toronto 01',
        country_code: 'CA',
        country_name: 'Canada',
        city: 'Toronto',
        public_ip: '159.203.110.80',
        wireguard_endpoint: '159.203.110.80:51820',
        wireguard_public_key: 'CA1ServerPubKeyBase64KeyAegisVPNToronto01=',
        latency_ms: 195,
        current_load_pct: 15
      },
      {
        name: 'Australia - Sydney 01',
        country_code: 'AU',
        country_name: 'Australia',
        city: 'Sydney',
        public_ip: '139.99.120.90',
        wireguard_endpoint: '139.99.120.90:51820',
        wireguard_public_key: 'AU1ServerPubKeyBase64KeyAegisVPNSydney01==',
        latency_ms: 160,
        current_load_pct: 28
      }
    ];

    for (const s of initialServers) {
      const serverId = `srv-${s.country_code?.toLowerCase()}-01`;
      this.servers.set(serverId, {
        id: serverId,
        name: s.name!,
        country_code: s.country_code!,
        country_name: s.country_name!,
        city: s.city!,
        public_ip: s.public_ip!,
        wireguard_endpoint: s.wireguard_endpoint!,
        wireguard_public_key: s.wireguard_public_key!,
        wireguard_port: 51820,
        capacity_mbps: 1000,
        current_load_pct: s.current_load_pct || 0,
        latency_ms: s.latency_ms || 50,
        packet_loss_pct: 0.0,
        is_healthy: true,
        active_peers_count: 5,
        version: '1.2.0',
        last_health_check: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    this.isInitialized = true;
  }
}

export const db = new AegisDatabase();
db.initialize();
