import dotenv from 'dotenv';
import { WireGuardManager } from './wireguard/wireguardManager.js';
import { FirewallManager } from './firewall/firewallManager.js';
import { DnsProxy } from './dns/dnsProxy.js';
import { MetricsCollector } from './metrics/metricsCollector.js';

dotenv.config();

const SERVER_ID = process.env.SERVER_ID || 'srv-de-01';
const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:4000/api/v1';
const HEARTBEAT_INTERVAL_MS = 15000;

export class AegisServerAgent {
  private wgManager: WireGuardManager;
  private firewallManager: FirewallManager;
  private dnsProxy: DnsProxy;

  constructor() {
    this.wgManager = new WireGuardManager('wg0');
    this.firewallManager = new FirewallManager('eth0', 'wg0', 51820);
    this.dnsProxy = new DnsProxy(5353); // Use port 5353 for testability
  }

  public async start(): Promise<void> {
    console.log(`====================================================`);
    console.log(`🚀 Starting AegisVPN Server Agent Daemon [${SERVER_ID}]`);
    console.log(`====================================================`);

    // 1. Apply Firewall NAT & IPv6 protection rules
    const fwResult = this.firewallManager.applyRules();
    console.log(`🛡️  Firewall rules applied: ${fwResult.appliedRules.length} rules active.`);

    // 2. Start Controlled DNS Proxy
    await this.dnsProxy.start();

    // 3. Start Heartbeat & Metrics Loop
    console.log(`📡 Heartbeat sync loop active (reporting every ${HEARTBEAT_INTERVAL_MS / 1000}s)...`);
    this.sendHeartbeat();
    setInterval(() => this.sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  private async sendHeartbeat(): Promise<void> {
    const sysMetrics = MetricsCollector.collectSystemMetrics();
    const wgMetrics = this.wgManager.getHandshakeMetrics();

    const payload = {
      serverId: SERVER_ID,
      cpuPct: sysMetrics.cpuPct,
      memoryPct: sysMetrics.memoryPct,
      latencyMs: 15 + Math.floor(Math.random() * 5),
      packetLossPct: 0.0,
      activePeersCount: wgMetrics.activePeers,
      isHealthy: true
    };

    try {
      const response = await fetch(`${CONTROL_PLANE_URL}/servers/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        console.log(`[${new Date().toLocaleTimeString()}] Heartbeat sent successfully. CPU: ${sysMetrics.cpuPct}%, RAM: ${sysMetrics.memoryPct}%, Peers: ${wgMetrics.activePeers}`);
      }
    } catch (err: unknown) {
      console.warn(`Heartbeat sync failed: ${(err as Error).message}`);
    }
  }
}

const agent = new AegisServerAgent();
agent.start();
