import { LeakDetectionService } from '../../control-plane/src/services/leakDetectionService.js';
import { dbReady } from '../../control-plane/src/db/db.js';

export async function testLeakProtection(): Promise<string | void> {
  await dbReady;
  console.log(`[TEST] Running Leak Protection Diagnostic Tests...`);


  // 1. Direct connection test (unprotected IP)
  const report1 = LeakDetectionService.runDiagnostic('203.0.113.5');
  if (report1.status.vpnTunnel !== 'Unprotected' || report1.status.dnsState !== 'Leaking') {
    throw new Error('Leak detection failed for direct unprotected IP');
  }

  // 2. Encrypted VPN connection test (matched server IP)
  const report2 = LeakDetectionService.runDiagnostic('159.69.100.40'); // DE Frankfurt server IP
  if (report2.status.vpnTunnel !== 'Protected' || report2.status.dnsState !== 'Protected') {
    throw new Error('Leak detection failed for VPN server exit IP');
  }

  console.log(`✓ Leak Protection diagnostic unit tests PASSED.`);
}
