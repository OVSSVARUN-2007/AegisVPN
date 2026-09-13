import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db, VpnPeerRow } from '../db/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { KeyService } from '../services/keyService.js';
import { config } from '../config/index.js';

const generateConfigSchema = z.object({
  deviceId: z.string(),
  serverId: z.string(),
  clientPrivateKey: z.string().optional()
});

export class PeerController {
  public static async generateConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const parse = generateConfigSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const { deviceId, serverId, clientPrivateKey } = parse.data;

    // Verify device
    const device = db.devices.get(deviceId);
    if (!device || device.user_id !== userId) {
      res.status(404).json({ error: 'Not Found', message: 'Device not found or unauthorized' });
      return;
    }

    if (device.is_revoked) {
      res.status(403).json({ error: 'Forbidden', message: 'This device has been revoked and cannot connect' });
      return;
    }

    // Verify server
    const server = db.servers.get(serverId);
    if (!server || !server.is_healthy) {
      res.status(400).json({ error: 'Server Unhealthy', message: 'Selected VPN server is offline or unhealthy' });
      return;
    }

    // Provision client keypair if not passed
    let privKey = clientPrivateKey;
    let pubKey = device.public_key;
    if (!privKey) {
      // Generate new key pair
      const kp = KeyService.generateKeyPair();
      privKey = kp.privateKey;
      pubKey = kp.publicKey;
      device.public_key = pubKey;
    }

    // Register active peer association
    const peerId = `peer-${uuidv4()}`;
    const allowedIps = `${device.allocated_ipv4}/32, ${device.allocated_ipv6}/128`;

    const newPeer: VpnPeerRow = {
      id: peerId,
      device_id: deviceId,
      server_id: serverId,
      public_key: pubKey,
      allowed_ips: allowedIps,
      is_active: true,
      created_at: new Date().toISOString()
    };

    db.peers.set(peerId, newPeer);
    device.current_server_id = serverId;
    device.last_connection = new Date().toISOString();

    // Construct valid WireGuard .conf content
    const rawConfig = KeyService.generateClientConfig({
      clientPrivateKey: privKey,
      clientAddressIPv4: device.allocated_ipv4,
      clientAddressIPv6: device.allocated_ipv6,
      dnsServer: config.wireguard.dnsServer,
      serverPublicKey: server.wireguard_public_key,
      serverEndpoint: server.wireguard_endpoint
    });

    res.json({
      message: 'WireGuard tunnel configuration generated successfully',
      deviceId: device.id,
      serverId: server.id,
      serverName: server.name,
      allocatedIPv4: device.allocated_ipv4,
      allocatedIPv6: device.allocated_ipv6,
      wireguardConfig: rawConfig
    });
  }
}
