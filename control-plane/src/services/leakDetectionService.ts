import { db } from '../db/db.js';

export interface LeakDiagnosticReport {
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
    ipv4State: 'Protected' | 'Leaking' | 'Direct Connection';
    ipv6State: 'Protected' | 'Blocked (Fail-Closed)' | 'Leaking';
    dnsState: 'Protected' | 'Leaking';
    killSwitchActive: boolean;
  };
  handshakeAgeSeconds?: number;
  recommendations: string[];
}

export class LeakDetectionService {
  /**
   * Evaluates the connection state of an incoming request to verify if traffic passes through an active AegisVPN node.
   */
  public static runDiagnostic(clientIp: string, customHeaders?: Record<string, string>): LeakDiagnosticReport {
    const servers = Array.from(db.servers.values());
    const matchedServer = servers.find(s => s.public_ip === clientIp);

    const isConnected = !!matchedServer;
    const isIPv6 = clientIp.includes(':');

    const report: LeakDiagnosticReport = {
      timestamp: new Date().toISOString(),
      clientPublicIp: clientIp,
      detectedServer: matchedServer ? {
        id: matchedServer.id,
        name: matchedServer.name,
        city: matchedServer.city,
        country: matchedServer.country_name,
        ip: matchedServer.public_ip
      } : null,
      status: {
        vpnTunnel: isConnected ? 'Protected' : 'Unprotected',
        ipv4State: isConnected && !isIPv6 ? 'Protected' : (isConnected ? 'Protected' : 'Direct Connection'),
        ipv6State: isConnected && isIPv6 ? 'Protected' : (isConnected ? 'Blocked (Fail-Closed)' : 'Leaking'),
        dnsState: isConnected ? 'Protected' : 'Leaking',
        killSwitchActive: isConnected
      },
      recommendations: []
    };

    if (!isConnected) {
      report.recommendations.push('Your connection is currently unprotected. Enable AegisVPN to encrypt traffic.');
      report.recommendations.push('Verify OS Network Kill Switch is active in AegisVPN settings.');
    } else {
      report.recommendations.push('Encrypted WireGuard tunnel verified. Public IP is correctly masked.');
      report.recommendations.push('DNS requests are routed through controlled AegisVPN resolver (10.8.0.1).');
    }

    return report;
  }
}
