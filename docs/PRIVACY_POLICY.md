# AegisVPN Privacy Policy & Data Minimization Policy

## 1. No-Log Guarantee
AegisVPN operates under a strict **Zero-Logs Architecture**. We believe privacy is a fundamental human right.

### We DO NOT Collect, Store, or Retain:
- **Browsing History**: We do not record the websites you visit, search queries you perform, or content you consume.
- **Traffic Content**: We never inspect, alter, intercept, or record packet contents, payload data, or HTTP/HTTPS headers.
- **DNS Queries**: All DNS resolution occurs in RAM on our VPN nodes; zero DNS query logs are stored or written to disk.
- **IP Connections**: We do not maintain logs linking your real public source IP address to specific VPN exit IP connections or timestamps.
- **Bandwidth Usage Per Destination**: We do not track which destinations consumed how much bandwidth.

---

## 2. Information We Process & Why

### 2.1 Account & Control Plane Data
- **Email Address**: Used solely for authentication, password resets, and account management.
- **Argon2id Password Hash**: Salted and hashed using Argon2id (`m=65536, t=3, p=4`). Plaintext passwords are never stored or logged.
- **Registered Devices & Public Keys**: Device names, Curve25519 public keys, assigned internal tunnel IPs (`10.8.X.X`), and creation timestamps to allow you to manage and revoke authorized devices.

### 2.2 Operational Infrastructure Metrics
To maintain system health, load balance server nodes, and prevent infrastructure abuse, our server nodes report aggregate metrics back to the Control Plane:
- Total CPU, Memory, and Disk utilization per server node.
- Total aggregate bandwidth throughput (Mbps) per server node.
- Total count of active connected WireGuard peers per server node.
- WireGuard handshake age (seconds since last handshake) to reclaim idle tunnel IPs.

*None of these operational metrics contain browsing activity, destination IPs, or user identity logs.*

---

## 3. Data Retention & Deletion
- **Account Deletion**: Deleting your account immediately purges your record, password hash, registered devices, and WireGuard public keys from our database.
- **Device Revocation**: Revoking a device instantly deletes its Curve25519 public key and internal IP allocation from both the Control Plane and active VPN server node memory.
