import crypto from 'crypto';

export interface WireGuardKeyPair {
  privateKey: string;
  publicKey: string;
}

export class KeyService {
  /**
   * Generates a real Curve25519 key pair for WireGuard using CSPRNG.
   */
  public static generateKeyPair(): WireGuardKeyPair {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('x25519', {
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' }
    });

    // Extract raw 32-byte public and private key values from DER ASN.1 header
    // DER X25519 PKCS#8 private key header is 16 bytes; raw key is last 32 bytes
    // DER X25519 SPKI public key header is 12 bytes; raw key is last 32 bytes
    const rawPrivateKey = privateKey.subarray(privateKey.length - 32);
    const rawPublicKey = publicKey.subarray(publicKey.length - 32);

    return {
      privateKey: rawPrivateKey.toString('base64'),
      publicKey: rawPublicKey.toString('base64')
    };
  }

  /**
   * Validates if a string is a valid base64-encoded WireGuard Curve25519 public key (32 bytes).
   */
  public static isValidPublicKey(pubKey: string): boolean {
    if (!pubKey || typeof pubKey !== 'string') return false;
    try {
      const buf = Buffer.from(pubKey, 'base64');
      return buf.length === 32;
    } catch {
      return false;
    }
  }

  /**
   * Allocates an available internal IPv4 and IPv6 tunnel address based on existing peer index.
   */
  public static allocateTunnelAddresses(peerIndex: number): { ipv4: string; ipv6: string } {
    const hostNumber = peerIndex + 2; // Start from .2 (10.8.0.1 is Gateway/DNS)
    const thirdOctet = Math.floor(hostNumber / 256);
    const fourthOctet = hostNumber % 256;
    
    const ipv4 = `10.8.${thirdOctet}.${fourthOctet}`;
    const ipv6 = `fd42:42:42::${hostNumber.toString(16)}`;

    return { ipv4, ipv6 };
  }

  /**
   * Dynamically constructs a standard, valid WireGuard client configuration file (.conf format).
   */
  public static generateClientConfig(params: {
    clientPrivateKey: string;
    clientAddressIPv4: string;
    clientAddressIPv6: string;
    dnsServer: string;
    serverPublicKey: string;
    serverEndpoint: string;
    presharedKey?: string;
  }): string {
    let config = `[Interface]
PrivateKey = ${params.clientPrivateKey}
Address = ${params.clientAddressIPv4}/32, ${params.clientAddressIPv6}/128
DNS = ${params.dnsServer}

[Peer]
PublicKey = ${params.serverPublicKey}
Endpoint = ${params.serverEndpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;

    if (params.presharedKey) {
      config += `PresharedKey = ${params.presharedKey}\n`;
    }

    return config;
  }
}
