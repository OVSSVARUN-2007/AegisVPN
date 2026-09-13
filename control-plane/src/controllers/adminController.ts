import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db, VpnServerRow } from '../db/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const addServerSchema = z.object({
  name: z.string().min(1),
  countryCode: z.string().length(2),
  countryName: z.string().min(1),
  city: z.string().min(1),
  publicIp: z.string().ip(),
  wireguardEndpoint: z.string(),
  wireguardPublicKey: z.string()
});

const updateUserRoleSchema = z.object({
  userId: z.string(),
  roleName: z.enum(['User', 'Support', 'NetworkOperator', 'SecurityOperator', 'Admin', 'SuperAdmin'])
});

export class AdminController {
  public static async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const users = Array.from(db.users.values()).map(u => ({
      id: u.id,
      email: u.email,
      isActive: u.is_active,
      roles: db.userRoles.filter(ur => ur.user_id === u.id).map(ur => db.roles.get(ur.role_id)?.name || ''),
      createdAt: u.created_at
    }));
    res.json({ users });
  }

  public static async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = updateUserRoleSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const { userId, roleName } = parse.data;
    const targetUser = db.users.get(userId);
    if (!targetUser) {
      res.status(404).json({ error: 'Not Found', message: 'User not found' });
      return;
    }

    const targetRole = Array.from(db.roles.values()).find(r => r.name === roleName);
    if (!targetRole) {
      res.status(404).json({ error: 'Not Found', message: 'Role not found' });
      return;
    }

    // Update role mapping
    db.userRoles = db.userRoles.filter(ur => ur.user_id !== userId);
    db.userRoles.push({ user_id: userId, role_id: targetRole.id });

    // Record audit event
    db.auditEvents.push({
      id: `audit-${uuidv4()}`,
      actor_id: req.user!.id,
      action: 'USER_ROLE_UPDATED',
      target_type: 'user',
      target_id: userId,
      changes: `Updated role to ${roleName}`,
      created_at: new Date().toISOString()
    });

    res.json({ message: `User role updated to ${roleName} successfully` });
  }

  public static async addServer(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = addServerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const d = parse.data;
    const serverId = `srv-${d.countryCode.toLowerCase()}-${uuidv4().substring(0, 8)}`;

    const newServer: VpnServerRow = {
      id: serverId,
      name: d.name,
      country_code: d.countryCode,
      country_name: d.countryName,
      city: d.city,
      public_ip: d.publicIp,
      wireguard_endpoint: d.wireguardEndpoint,
      wireguard_public_key: d.wireguardPublicKey,
      wireguard_port: 51820,
      capacity_mbps: 1000,
      current_load_pct: 0,
      latency_ms: 25,
      packet_loss_pct: 0.0,
      is_healthy: true,
      active_peers_count: 0,
      version: '1.0.0',
      last_health_check: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    db.servers.set(serverId, newServer);

    db.auditEvents.push({
      id: `audit-${uuidv4()}`,
      actor_id: req.user!.id,
      action: 'SERVER_ADDED',
      target_type: 'vpn_server',
      target_id: serverId,
      changes: `Added server ${newServer.name} (${newServer.public_ip})`,
      created_at: new Date().toISOString()
    });

    res.status(201).json({ message: 'VPN server node registered successfully', server: newServer });
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ auditEvents: db.auditEvents });
  }
}
