import { testKeyService } from './unit/keyService.test.js';
import { testServerSelection } from './unit/serverSelection.test.js';
import { testLeakProtection } from './unit/leakProtection.test.js';
import { testKillSwitch } from './unit/killswitch.test.js';

async function runAllTests() {
  console.log(`====================================================`);
  console.log(`🧪 AegisVPN Automated Test Suite Execution`);
  console.log(`====================================================\n`);

  try {
    testKeyService();
    await testServerSelection();
    await testLeakProtection();
    testKillSwitch();


    console.log(`\n====================================================`);
    console.log(`🎉 ALL AEGISVPN AUTOMATED TESTS PASSED SUCCESSFULLY!`);
    console.log(`====================================================`);
  } catch (err: unknown) {
    console.error(`\n❌ Test Suite Failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

runAllTests();
