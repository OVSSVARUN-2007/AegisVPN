# AegisVPN Architecture

## Overview
AegisVPN is a production-grade, zero-trust WireGuard VPN platform designed around a strict decoupling between the **Control Plane** and the **Data Plane**.

```
+-----------------------------------------------------------------------+
|                             CLIENT DEVICE                             |
|  +-------------------------+            +--------------------------+  |
|  | AegisVPN Web Dashboard  |            | AegisVPN Native/CLI Daemon| |
|  +------------+------------+            +------------+-------------+  |
+---------------|--------------------------------------|----------------+
                |                                      |
                | HTTPS / TLS 1.3                      | WireGuard Tunnel (UDP)
                v                                      v
+------------------------------------+  +-------------------------------+
|       VPN CONTROL PLANE API        |  |       VPN DATA PLANE NODE     |
| - Authentication (Argon2id + JWT)  |  | - WireGuard Interface (wg0)   |
| - Device & Peer Lifecycle Mgmt     |  | - OS Forwarding & NAT         |
| - Server Discovery & Selection     |  | - Controlled DNS Proxy        |
| - Health Monitoring & Failover     |  | - IPv6 Leak / Drop Firewall   |
| - PostgreSQL Data Store            |  | - Handshake & Metric Reporter |
+------------------------------------+  +---------------+---------------+
                                                        |
                                                        | Encrypted Transit
                                                        v
                                                   INTERNET
```

---

## 1. Core Principles

### 1.1 Separation of Control Plane & Data Plane
- **Control Plane**: Responsible for user account management, authentication, device registration, WireGuard key provisioning, server selection, and system health metrics. It operates over standard HTTPS APIs.
- **Data Plane**: Responsible strictly for WireGuard packet encapsulation, decryption, IP routing, NAT, firewalling, and DNS resolution.
- **Resilience**: The Control Plane **never** sits in the user's active internet traffic path. If the Control Plane API becomes temporarily unreachable or suffers an outage, existing established WireGuard VPN tunnels continue functioning uninterrupted without data loss or dropping the connection.

### 1.2 Zero-Trust Security Model
- No client input, API request, or server node registration is trusted by default.
- Every API endpoint requires authentication and strict Role-Based Access Control (RBAC).
- Least-privilege access is enforced across database queries, service accounts, and administrative roles.

### 1.3 Privacy by Design (No-Log Policy)
- The system collects zero browsing history, URLs, HTTP headers, packet payloads, or DNS queries.
- Operational logs are limited to high-level server node infrastructure performance metrics (CPU, RAM, total bandwidth throughput, total active peer count) without linking web traffic to specific user identities.

---

## 2. Key Lifecycle & WireGuard Cryptography

1. **Client-Side Key Generation**:
   - Curve25519 keypairs are generated directly on the client device.
   - The private key is retained exclusively on the client device and stored securely (e.g., system keychain or restricted permissions).
   - Only the Curve25519 public key is transmitted to the Control Plane API for peer registration.
2. **Peer Provisioning**:
   - The Control Plane validates the device authorization and assigns an available internal IPv4 (`10.8.X.X/32`) and IPv6 (`fd42:42:42::X/128`) tunnel address.
   - The server node receives the peer configuration update (Public Key, AllowedIPs) from the Control Plane via mTLS/signed sync.
3. **Revocation & Rotation**:
   - When a device is revoked or a key rotated, the Control Plane immediately updates the server node registry, issuing a `wg set wg0 peer <pubkey> remove` command on all active nodes to instantly terminate active tunnels.

---

## 3. Network Architecture & Leak Protection

### 3.1 DNS Path & Protection
- Every VPN server node runs a controlled local DNS resolver listening on `10.8.0.1:53`.
- All client DNS queries are directed into the encrypted WireGuard tunnel to `10.8.0.1`.
- Direct unencrypted DNS queries to external servers (e.g., port 53 UDP/TCP to arbitrary IPs) outside the tunnel are blocked by OS firewall rules.

### 3.2 IPv4 / IPv6 Leak Protection & Fail-Closed Strategy
- Full-tunnel WireGuard profiles route `0.0.0.0/0` and `::/0` through `wg0`.
- If a server node or network does not natively support IPv6 internet routing, an explicit **IPv6 Blackhole / Drop** rule (`iptables -A FORWARD -i wg0 -p ipv6 -j DROP` or `ip6tables -A OUTPUT -o eth0 -j DROP`) is enforced to prevent unencrypted IPv6 bypass.

### 3.3 OS-Level Network Kill Switch
- When active, the client daemon installs firewall rules (`iptables` / `nftables`) restricting all outbound IP traffic.
- **Allowed Exception**: Outbound traffic to the assigned VPN server's public endpoint IP on the designated WireGuard UDP port, and loopback traffic.
- If the WireGuard interface drops unexpectedly, all internet egress is immediately blocked at the OS kernel level, preventing unprotected packet leaks.

---

## 4. Multi-Server Infrastructure & Smart Failover

### 4.1 Server Node Registry
- Dynamically registered nodes in global locations (IN, SG, JP, DE, NL, UK, US, CA, AU).
- Each node runs the `aegis-agent` daemon, reporting health, active peer count, CPU load, and network throughput every 15 seconds.

### 4.2 Smart Server Selection Algorithm
- Servers are scored dynamically using the formula:
  $$\text{Score} = \text{Latency (ms)} + (\text{PacketLoss \%} \times 10) + \left(\frac{\text{Load \%}}{100} \times 30\right) + \text{Health Penalty}$$
- The client automatically selects the node with the lowest total score.

### 4.3 Automatic Failover Protocol
1. Node health check fails for 3 consecutive intervals (or packet loss exceeds 50%).
2. Control Plane marks server node as `UNHEALTHY`.
3. Client daemon detects connection loss or node degradation.
4. Client daemon queries Control Plane for the next healthiest node score.
5. Client daemon re-keys/re-provisions peer to new node, establishes WireGuard handshake, verifies routing and DNS, and restores connection seamlessly.
