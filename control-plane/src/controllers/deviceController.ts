import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db, DeviceRow } from '../db/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { KeyService } from '../services/keyService.js';

const registerDeviceSchema = z.object({
  name: z.string().min(1).max(100),
  platform: z.string().min(1).max(50),
  publicKey: z.string().min(1)
});

export class DeviceController {
  public static async listDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const devices = Array.from(db.devices.values()).filter(d => d.user_id === userId);
    res.json({ devices });
  }

  public static async registerDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const parse = registerDeviceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const { name, platform, publicKey } = parse.data;

    if (!KeyService.isValidPublicKey(publicKey)) {
      res.status(400).json({ error: 'Invalid Key', message: 'Provided string is not a valid 32-byte Base64 WireGuard public key' });
      return;
    }

    // Check key uniqueness
    const existingKey = Array.from(db.devices.values()).find(d => d.public_key === publicKey);
    if (existingKey) {
      res.status(400).json({ error: 'Duplicate Key', message: 'This WireGuard public key is already registered' });
      return;
    }

    // Allocate internal tunnel addresses
    const peerIndex = db.devices.size;
    const { ipv4, ipv6 } = KeyService.allocateTunnelAddresses(peerIndex);

    const deviceId = `dev-${uuidv4()}`;
    const newDevice: DeviceRow = {
      id: deviceId,
      user_id: userId,
      name,
      platform,
      public_key: publicKey,
      allocated_ipv4: ipv4,
      allocated_ipv6: ipv6,
      is_revoked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.devices.set(deviceId, newDevice);

    res.status(201).json({
      message: 'Device registered successfully',
      device: newDevice
    });
  }

  public static async revokeDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const deviceId = req.params.id;

    const device = db.devices.get(deviceId);
    if (!device || device.user_id !== userId) {
      res.status(404).json({ error: 'Not Found', message: 'Device not found' });
      return;
    }

    device.is_revoked = true;
    device.updated_at = new Date().toISOString();

    // Remove active peers across all server nodes
    for (const [peerId, peer] of db.peers.entries()) {
      if (peer.device_id === deviceId) {
        db.peers.delete(peerId);
      }
    }

    // Record audit log
    db.auditEvents.push({
      id: `audit-${uuidv4()}`,
      actor_id: userId,
      action: 'DEVICE_REVOKED',
      target_type: 'device',
      target_id: deviceId,
      changes: `Revoked device ${device.name} (${device.public_key})`,
      created_at: new Date().toISOString()
    });

    res.json({ message: 'Device revoked successfully. Active WireGuard tunnel access terminated.' });
  }
}
