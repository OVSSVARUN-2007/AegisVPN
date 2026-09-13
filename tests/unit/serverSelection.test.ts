import { ServerSelectionService } from '../../control-plane/src/services/serverSelectionService.js';
import { db, dbReady } from '../../control-plane/src/db/db.js';

export async function testServerSelection(): Promise<void> {
  await dbReady;
  console.log(`[TEST] Running Server Selection & Failover Tests...`);


  // 1. Calculate score for Mumbai node (15ms latency, 12% load) vs US node (180ms latency)
  const ranked = ServerSelectionService.getRankedServers();
  if (ranked.length < 9) {
    throw new Error(`Expected at least 9 servers in registry, found ${ranked.length}`);
  }

  // Top ranked server should be Mumbai or Singapore due to lowest latency
  const best = ServerSelectionService.selectBestServer();
  if (!best || best.server.country_code !== 'IN') {
    throw new Error(`Expected India server node to rank #1, got: ${best?.server.name}`);
  }

  // 2. Failover test
  const fallback = ServerSelectionService.getFailoverServer('srv-in-01');
  if (!fallback || fallback.id === 'srv-in-01') {
    throw new Error('Failover logic failed to select healthy alternative server');
  }

  console.log(`✓ Server Selection & Failover unit tests PASSED.`);
}
