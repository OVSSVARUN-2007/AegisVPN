#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { TunnelManager } from './tunnel/tunnelManager.js';

const program = new Command();
const tunnelManager = new TunnelManager();
const SESSION_FILE = path.join(process.env.HOME || '/tmp', '.aegisvpn-session.json');
const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:4000/api/v1';

function saveSession(data: any) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

function loadSession(): any | null {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

program
  .name('aegisvpn')
  .description('AegisVPN Production CLI Client & OS Kill Switch Engine')
  .version('1.0.0');

// Command: login
program
  .command('login')
  .description('Authenticate with AegisVPN Control Plane API')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .action(async (options) => {
    const email = options.email || 'admin@aegisvpn.com';
    const password = options.password || 'AdminPass123!';

    console.log(`🔐 Logging into AegisVPN Control Plane (${CONTROL_PLANE_URL})...`);
    try {
      const response = await fetch(`${CONTROL_PLANE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(`❌ Login failed: ${data.message || data.error}`);
        process.exit(1);
      }

      saveSession(data);
      console.log(`✓ Authenticated successfully as ${data.user.email}`);
      console.log(`  Roles: ${data.user.roles.join(', ')}`);
    } catch (err: unknown) {
      console.error(`❌ Connection error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// Command: servers
program
  .command('servers')
  .description('List available VPN servers and latency scores')
  .action(async () => {
    try {
      const response = await fetch(`${CONTROL_PLANE_URL}/servers`);
      const data = await response.json();
      console.log(`\n🌍 AegisVPN Global Server Infrastructure (${data.totalServers} Nodes):`);
      console.log(`-----------------------------------------------------------------------------------------`);
      console.log(`ID                    LOCATION                    IP              LOAD   LATENCY  SCORE`);
      console.log(`-----------------------------------------------------------------------------------------`);
      for (const s of data.servers) {
        const idStr = s.id.padEnd(21);
        const locStr = `${s.name}`.padEnd(27);
        const ipStr = s.public_ip.padEnd(15);
        const loadStr = `${s.current_load_pct}%`.padEnd(6);
        const latStr = `${s.latency_ms}ms`.padEnd(8);
        console.log(`${idStr} ${locStr} ${ipStr} ${loadStr} ${latStr} ${s.compositeScore}`);
      }
      console.log(`-----------------------------------------------------------------------------------------\n`);
    } catch (err: unknown) {
      console.error(`❌ Error fetching server list: ${(err as Error).message}`);
    }
  });

// Command: connect
program
  .command('connect [serverId]')
  .description('Establish real encrypted WireGuard tunnel')
  .option('-k, --killswitch', 'Enable OS-level network kill switch', true)
  .action(async (targetServerId, options) => {
    const session = loadSession();
    if (!session || !session.accessToken) {
      console.error(`❌ Authentication required. Please run 'aegisvpn login' first.`);
      process.exit(1);
    }

    let serverId = targetServerId;
    if (!serverId) {
      // Smart select best server
      console.log(`⚡ Auto-selecting optimal server node...`);
      const res = await fetch(`${CONTROL_PLANE_URL}/servers/smart-select`);
      const data = await res.json();
      serverId = data.recommendedServer?.id || 'srv-de-01';
    }

    // 1. Register device if needed
    console.log(`🔑 Provisioning WireGuard Curve25519 device key...`);
    const crypto = await import('crypto');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('x25519', {
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' }
    });
    const pubKeyBase64 = publicKey.subarray(publicKey.length - 32).toString('base64');
    const privKeyBase64 = privateKey.subarray(privateKey.length - 32).toString('base64');

    const devRes = await fetch(`${CONTROL_PLANE_URL}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        name: 'CLI-Laptop-Device',
        platform: 'Linux CLI',
        publicKey: pubKeyBase64
      })
    });
    const devData = await devRes.json();
    const deviceId = devData.device?.id || 'dev-cli-01';

    // 2. Fetch WireGuard config profile
    console.log(`⚙️  Fetching dynamic WireGuard profile from Control Plane...`);
    const peerRes = await fetch(`${CONTROL_PLANE_URL}/peers/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        deviceId,
        serverId,
        clientPrivateKey: privKeyBase64
      })
    });
    const peerData = await peerRes.json();

    if (!peerRes.ok) {
      console.error(`❌ Failed to generate config: ${peerData.message || peerData.error}`);
      process.exit(1);
    }

    // 3. Establish Tunnel
    await tunnelManager.connect({
      serverId,
      serverName: peerData.serverName,
      serverPublicIp: peerData.wireguardConfig.match(/Endpoint = ([\d\.]+):/)?.[1] || '159.69.100.40',
      allocatedIPv4: peerData.allocatedIPv4,
      allocatedIPv6: peerData.allocatedIPv6,
      wireguardConfig: peerData.wireguardConfig,
      enableKillSwitch: options.killswitch
    });
  });

// Command: disconnect
program
  .command('disconnect')
  .description('Disconnect active WireGuard tunnel')
  .action(async () => {
    await tunnelManager.disconnect();
  });

// Command: status
program
  .command('status')
  .description('View current connection status and connection quality metrics')
  .action(async () => {
    const status = tunnelManager.getStatus();
    console.log(`\n🛡️  AegisVPN Connection Status:`);
    console.log(`-----------------------------------------------`);
    console.log(`State:         ${status.state}`);
    if (status.state === 'Connected') {
      console.log(`Server:        ${status.serverName} (${status.serverId})`);
      console.log(`Public IP:     ${status.serverPublicIp}`);
      console.log(`Tunnel IPv4:   ${status.allocatedIPv4}`);
      console.log(`Tunnel IPv6:   ${status.allocatedIPv6}`);
      console.log(`Latency:       ${status.latencyMs} ms`);
      console.log(`Packet Loss:   ${status.packetLossPct}%`);
      console.log(`Download:      ${status.downloadMbps} Mbps`);
      console.log(`Upload:        ${status.uploadMbps} Mbps`);
      console.log(`Kill Switch:   ${status.killSwitchActive ? '✓ Active' : '✗ Inactive'}`);
      console.log(`DNS Path:      ${status.dnsProtected ? '✓ Protected (10.8.0.1)' : '✗ Unprotected'}`);
    }
    console.log(`-----------------------------------------------\n`);
  });

// Command: diagnose
program
  .command('diagnose')
  .description('Run live leak protection diagnostic test')
  .action(async () => {
    console.log(`🔍 Running AegisVPN Privacy & Leak Protection Diagnostic Test...`);
    try {
      const response = await fetch(`${CONTROL_PLANE_URL}/diagnostics/leak-test`);
      const data = await response.json();
      console.log(`\nDiagnostic Report [${data.timestamp}]:`);
      console.log(`-----------------------------------------------`);
      console.log(`Detected Public IP: ${data.clientPublicIp}`);
      console.log(`VPN Tunnel State:   ${data.status.vpnTunnel}`);
      console.log(`IPv4 Leak State:    ${data.status.ipv4State}`);
      console.log(`IPv6 Leak State:    ${data.status.ipv6State}`);
      console.log(`DNS Protection:     ${data.status.dnsState}`);
      console.log(`Kill Switch:        ${data.status.killSwitchActive ? '✓ Active' : '✗ Inactive'}`);
      console.log(`\nRecommendations:`);
      for (const rec of data.recommendations) {
        console.log(`  - ${rec}`);
      }
      console.log(`-----------------------------------------------\n`);
    } catch (err: unknown) {
      console.error(`❌ Diagnostic test error: ${(err as Error).message}`);
    }
  });

// Command: killswitch
program
  .command('killswitch <action>')
  .description('Manage OS-level network kill switch (on | off | status)')
  .action((action) => {
    if (action === 'on') {
      tunnelManager.toggleKillSwitch(true);
      console.log(`🛡️  OS Firewall Kill Switch ENABLED.`);
    } else if (action === 'off') {
      tunnelManager.toggleKillSwitch(false);
      console.log(`⚠️  OS Firewall Kill Switch DISABLED.`);
    } else {
      const status = tunnelManager.getStatus();
      console.log(`Kill Switch status: ${status.killSwitchActive ? 'ACTIVE' : 'INACTIVE'}`);
    }
  });

program.parse(process.argv);
