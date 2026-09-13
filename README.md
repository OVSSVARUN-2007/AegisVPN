# AegisVPN — Production-Grade, Zero-Trust WireGuard Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WireGuard](https://img.shields.io/badge/Protocol-WireGuard-purple.svg)](https://www.wireguard.com/)
[![Security: Argon2id](https://img.shields.io/badge/Password_Security-Argon2id-emerald.svg)](https://en.wikipedia.org/wiki/Argon2)
[![Tests: Passed](https://img.shields.io/badge/Test_Suite-PASSED-success.svg)](tests/)

AegisVPN is a production-grade, privacy-first WireGuard VPN platform. It decouples the **Control Plane** (Authentication, User accounts, Device lifecycle, Key management, Server scoring, Health metrics, RBAC) from the **Data Plane** (WireGuard tunnel encapsulation, OS iptables NAT forwarding, Controlled DNS proxy, IPv6 leak protection, OS-level kill switch).

---

## 🏗️ Core Architecture

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

## ✨ Features & Capabilities

- 🔒 **Real WireGuard Protocol**: Dynamic Curve25519 keypair generation using CSPRNG. Client private keys **never** leave the client device or get sent to the Control Plane.
- 🛡️ **Zero-Trust Security & Argon2id Hashing**: Passwords are hashed with Argon2id (`m=65536, t=3, p=4`). API is hardened with JWT refresh rotation, rate limiting, and Helmet headers.
- 🚫 **OS Network Kill Switch**: Kernel/OS-level `iptables`/`nftables` rules that block 100% of outbound IP traffic if the tunnel drops unexpectedly, allowing egress strictly to the assigned VPN server endpoint IP.
- 🌐 **IPv4 + IPv6 Leak Protection**: Dual-stack WireGuard tunneling with fail-closed IPv6 blackhole drop rules (`iptables -A FORWARD -i wg0 -p ipv6 -j DROP`).
- ⚡ **Controlled DNS Path**: Directs client DNS queries to `10.8.0.1:53` inside the WireGuard tunnel, preventing DNS query exposure to ISPs or local Wi-Fi snoops.
- 🌍 **9 Global Server Locations**: Pre-populated nodes in India, Singapore, Japan, Germany, Netherlands, United Kingdom, United States, Canada, and Australia.
- 📊 **Smart Server Selection**: Composite scoring algorithm calculating:
  $$\text{Score} = \text{Latency (ms)} + (\text{PacketLoss \%} \times 10) + \left(\frac{\text{Load \%}}{100} \times 30\right) + \text{Health Penalty}$$
- 🔄 **Automatic Server Failover**: Instant health degradation detection and auto-routing to the next healthiest node.
- 👥 **RBAC Authorization**: 6 defined permission roles (`User`, `Support`, `NetworkOperator`, `SecurityOperator`, `Admin`, `SuperAdmin`) with security audit logging.
- 💻 **Cross-Platform Native CLI & Web Dashboard**: Command-line tool (`aegisvpn`) and React + Vite Glassmorphic Web UI.

---

## 📁 Repository Structure

```
.
├── docs/                      # Comprehensive Architecture, Threat Model, Privacy Policy, OpenAPI Specs & Hardening
│   ├── ARCHITECTURE.md
│   ├── THREAT_MODEL.md
│   ├── PRIVACY_POLICY.md
│   ├── SECURITY_MODEL.md
│   ├── OPENAPI.yaml
│   └── DEPLOYMENT.md
├── control-plane/             # Node.js/TypeScript REST API & Database Engine
├── server-node/               # VPN Node Agent Daemon (WireGuard, Firewall NAT, DNS Proxy, Health)
├── cli/                       # AegisVPN Native CLI Client & OS Network Kill Switch Engine
├── client/                    # React + Vite Modern Glassmorphism Web Dashboard
├── tests/                     # Automated Test Suite (Unit, Integration, Leak, Failover, Kill Switch)
├── docker-compose.yml
├── Dockerfile.control-plane
├── Dockerfile.vpn-node
└── Dockerfile.client-web
```

---

## 🚀 Quickstart & Setup Guide

### 1. Run Control Plane API Server
```bash
cd control-plane
npm install
npm run dev
```
API running on `http://localhost:4000/api/v1`

### 2. Run AegisVPN CLI Client
```bash
cd cli
npm install
npx tsx src/index.ts login
npx tsx src/index.ts servers
npx tsx src/index.ts connect srv-de-01
npx tsx src/index.ts status
npx tsx src/index.ts diagnose
```

### 3. Run Web Dashboard
```bash
cd client
npm install
npm run dev
```
Web UI running on `http://localhost:3000`

---

## 🧪 Running Automated Tests

Run the full automated test suite covering Key Generation, Server Selection, Leak Protection, and OS Kill Switch rules:

```bash
cd tests
npm test
```

Expected Output:
```
====================================================
🧪 AegisVPN Automated Test Suite Execution
====================================================

[TEST] Running KeyService Unit Tests...
✓ KeyService unit tests PASSED.
[TEST] Running Server Selection & Failover Tests...
✓ Server Selection & Failover unit tests PASSED.
[TEST] Running Leak Protection Diagnostic Tests...
✓ Leak Protection diagnostic unit tests PASSED.
[TEST] Running Kill Switch Policy Tests...
✓ Kill Switch policy unit tests PASSED.

====================================================
🎉 ALL AEGISVPN AUTOMATED TESTS PASSED SUCCESSFULLY!
====================================================
```

---

## 🐳 Docker Deployment

Orchestrate the entire platform via Docker Compose:
```bash
docker-compose up --build
```

---

## 📜 License
MIT License. Built for production-grade privacy, reliability, and security.
