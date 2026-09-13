import { db, VpnServerRow } from '../db/db.js';

export interface ServerScoreResult {
  server: VpnServerRow;
  score: number;
  breakdown: {
    latencyScore: number;
    packetLossPenalty: number;
    loadPenalty: number;
    healthPenalty: number;
  };
}

export class ServerSelectionService {
  /**
   * Calculates a composite performance & reliability score for a given VPN server.
   * Lower score indicates a faster, healthier, and less loaded server node.
   */
  public static calculateServerScore(server: VpnServerRow): ServerScoreResult {
    let healthPenalty = 0;
    if (!server.is_healthy) {
      healthPenalty = 10000; // Mark unhealthy servers with huge penalty
    }

    const latencyScore = server.latency_ms;
    const packetLossPenalty = server.packet_loss_pct * 10;
    const loadPenalty = (server.current_load_pct / 100) * 30;

    const totalScore = Math.round(latencyScore + packetLossPenalty + loadPenalty + healthPenalty);

    return {
      server,
      score: totalScore,
      breakdown: {
        latencyScore,
        packetLossPenalty,
        loadPenalty,
        healthPenalty
      }
    };
  }

  /**
   * Evaluates all active VPN server nodes and returns them sorted by optimal performance.
   */
  public static getRankedServers(): ServerScoreResult[] {
    const servers = Array.from(db.servers.values());
    const scored = servers.map(s => this.calculateServerScore(s));
    return scored.sort((a, b) => a.score - b.score);
  }

  /**
   * Automatically selects the single fastest and healthiest server node.
   */
  public static selectBestServer(): ServerScoreResult | null {
    const ranked = this.getRankedServers();
    const healthyRanked = ranked.filter(r => r.server.is_healthy);
    return healthyRanked.length > 0 ? healthyRanked[0] : null;
  }

  /**
   * Performs automatic failover lookup: given a failed server ID, returns the best alternative server node.
   */
  public static getFailoverServer(failedServerId: string): VpnServerRow | null {
    // 1. Mark failed server as unhealthy in database
    const failedServer = db.servers.get(failedServerId);
    if (failedServer) {
      failedServer.is_healthy = false;
      failedServer.last_health_check = new Date().toISOString();
    }

    // 2. Select next optimal healthy server node
    const best = this.selectBestServer();
    return best ? best.server : null;
  }
}
