import { KeyService } from '../../control-plane/src/services/keyService.js';

export function testKeyService(): void {
  console.log(`[TEST] Running KeyService Unit Tests...`);

  // 1. Generate keypair
  const kp = KeyService.generateKeyPair();
  if (!kp.privateKey || !kp.publicKey) {
    throw new Error('Key generation failed: empty keypair');
  }

  // 2. Validate public key
  const isValid = KeyService.isValidPublicKey(kp.publicKey);
  if (!isValid) {
    throw new Error(`Public key validation failed for: ${kp.publicKey}`);
  }

  const invalidKeyCheck = KeyService.isValidPublicKey('not-a-valid-key');
  if (invalidKeyCheck) {
    throw new Error('Invalid key check failed: false positive');
  }

  // 3. Address allocation
  const addrs = KeyService.allocateTunnelAddresses(0);
  if (addrs.ipv4 !== '10.8.0.2' || addrs.ipv6 !== 'fd42:42:42::2') {
    throw new Error(`Unexpected tunnel IP allocation: ${JSON.stringify(addrs)}`);
  }

  // 4. Config profile generation
  const conf = KeyService.generateClientConfig({
    clientPrivateKey: kp.privateKey,
    clientAddressIPv4: addrs.ipv4,
    clientAddressIPv6: addrs.ipv6,
    dnsServer: '10.8.0.1',
    serverPublicKey: 'DE1ServerPubKeyBase64KeyAegisVPNFrankfurt=',
    serverEndpoint: '159.69.100.40:51820'
  });

  if (!conf.includes('[Interface]') || !conf.includes('AllowedIPs = 0.0.0.0/0, ::/0')) {
    throw new Error('WireGuard configuration formatting test failed');
  }

  console.log(`✓ KeyService unit tests PASSED.`);
}
