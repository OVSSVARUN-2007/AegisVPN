import { Request, Response } from 'express';
import { db } from '../db/db.js';
import { ServerSelectionService } from '../services/serverSelectionService.js';
import { z } from 'zod';

const updateMetricsSchema = z.object({
  serverId: z.string(),
  cpuPct: z.number().min(0).max(100),
  memoryPct: z.number().min(0).max(100),
  latencyMs: z.number().min(0),
  packetLossPct: z.number().min(0).max(100),
  activePeersCount: z.number().min(0),
  isHealthy: z.boolean()
});

export class ServerController {
  public static async listServers(req: Request, res: Response): Promise<void> {
    const ranked = ServerSelectionService.getRankedServers();
    res.json({
      totalServers: ranked.length,
      servers: ranked.map(r => ({
        ...r.server,
        compositeScore: r.score,
        scoreBreakdown: r.breakdown
      }))
    });
  }

  public static async smartSelect(req: Request, res: Response): Promise<void> {
    const best = ServerSelectionService.selectBestServer();
    if (!best) {
      res.status(503).json({ error: 'Unavailable', message: 'No healthy VPN servers available' });
      return;
    }
    res.json({
      recommendedServer: best.server,
      score: best.score,
      breakdown: best.breakdown
    });
  }

  public static async updateServerMetrics(req: Request, res: Response): Promise<void> {
    const parse = updateMetricsSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const { serverId, cpuPct, memoryPct, latencyMs, packetLossPct, activePeersCount, isHealthy } = parse.data;

    const server = db.servers.get(serverId);
    if (!server) {
      res.status(404).json({ error: 'Not Found', message: 'Server node not found' });
      return;
    }

    server.current_load_pct = Math.round((cpuPct + memoryPct) / 2);
    server.latency_ms = latencyMs;
    server.packet_loss_pct = packetLossPct;
    server.active_peers_count = activePeersCount;
    server.is_healthy = isHealthy;
    server.last_health_check = new Date().toISOString();

    res.json({ message: 'Server metrics updated successfully', server });
  }

  public static async triggerFailover(req: Request, res: Response): Promise<void> {
    const { failedServerId } = req.body;
    if (!failedServerId || typeof failedServerId !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'Missing failedServerId' });
      return;
    }

    const failoverServer = ServerSelectionService.getFailoverServer(failedServerId);
    if (!failoverServer) {
      res.status(503).json({ error: 'Failover Failed', message: 'No healthy alternative server node available' });
      return;
    }

    res.json({
      message: 'Failover server selected successfully',
      failedServerId,
      failoverTarget: failoverServer
    });
  }
}
