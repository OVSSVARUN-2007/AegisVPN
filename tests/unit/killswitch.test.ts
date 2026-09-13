import { KillSwitchEngine } from '../../cli/src/killswitch/killswitch.js';

export function testKillSwitch(): void {
  console.log(`[TEST] Running Kill Switch Policy Tests...`);

  const ks = new KillSwitchEngine();
  const res = ks.enable('159.69.100.40');

  if (!res.success || res.appliedRules.length === 0) {
    throw new Error('Kill switch activation failed to generate firewall rules');
  }

  const dropPolicyRule = res.appliedRules.find(r => r.includes('-P OUTPUT DROP'));
  if (!dropPolicyRule) {
    throw new Error('Kill switch missing default OUTPUT DROP policy rule');
  }

  ks.disable();
  const status = ks.getStatus();
  if (status.active) {
    throw new Error('Kill switch disable failed');
  }

  console.log(`✓ Kill Switch policy unit tests PASSED.`);
}
