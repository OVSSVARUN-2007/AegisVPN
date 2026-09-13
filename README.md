# 🛡️ AegisVPN

### Production-Grade · Privacy-First · WireGuard-Based VPN Platform

AegisVPN is a **real, production-oriented VPN platform** built around [WireGuard](https://www.wireguard.com/) for secure, high-performance encrypted network connectivity.

It is designed around four principles:

> **Security → Privacy → Reliability → Correctness**

AegisVPN is not a simulated VPN, fake dashboard, proxy UI, or demonstration of a VPN connection. The architecture is designed to establish **real WireGuard tunnels, route real Internet traffic, verify tunnel state, prevent traffic leaks, and fail safely**.

> ⚠️ **Privacy Notice:** AegisVPN does not claim to make users completely anonymous, invisible, or impossible to trace. A VPN provides network privacy and changes the network path/IP visible to websites, but it does not eliminate browser fingerprinting, account-based identification, malware, endpoint compromise, traffic correlation, or other forms of tracking.

---

## ✨ Highlights

* 🔐 Real **WireGuard** encrypted tunnels
* 🧩 Separate **Control Plane / Data Plane**
* 🛡️ Zero-trust security architecture
* 🔑 Device-specific cryptographic keys
* 🔄 Key rotation and peer revocation
* 🚫 DNS leak protection
* 🌐 IPv4 + IPv6 leak protection
* ☠️ OS/network-level kill switch
* 🔁 Automatic reconnection
* 🌍 Multi-server infrastructure
* ⚡ Latency-aware server selection
* 🔄 Automatic server failover
* 🖥️ Native client architecture
* 📊 Real connection-quality measurements
* 🩺 Infrastructure health monitoring
* 🔒 Privacy-first/no-browsing-history architecture
* 🧪 Automated security and failure testing
* 📚 OpenAPI/API documentation
* 🗄️ PostgreSQL control-plane database
* 👥 Device management
* 👮 Role-based access control
* 🔐 Production-grade secret management
* 📦 Versioned deployments and rollback support

---

# 🏗️ Architecture

AegisVPN is divided into two major planes.

```text
                         ┌───────────────────────┐
                         │      VPN CLIENTS      │
                         │                       │
                         │ Linux │ Windows       │
                         │ macOS │ Android       │
                         │ iOS   │               │
                         └───────────┬───────────┘
                                     │
                                     │ Authentication
                                     │ Server Discovery
                                     │ Peer Management
                                     ▼
                         ┌───────────────────────┐
                         │     CONTROL PLANE     │
                         │                       │
                         │ Authentication        │
                         │ Device Management     │
                         │ Server Registry       │
                         │ Peer Lifecycle        │
                         │ Configuration         │
                         │ Health Information    │
                         │ Policy Management      │
                         └───────────┬───────────┘
                                     │
                          Configuration / Control
                                     │
                                     ▼
              ┌─────────────────────────────────────────┐
              │             VPN DATA PLANE              │
              │                                         │
              │       ┌─────────────────────┐           │
              │       │   WireGuard Cluster │           │
              │       └──────────┬──────────┘           │
              │                  │                      │
              │        ┌─────────┼─────────┐            │
              │        ▼         ▼         ▼            │
              │     Server A  Server B  Server C       │
              │        │         │         │            │
              │        └─────────┼─────────┘            │
              │                  ▼                      │
              │              Internet                   │
              └─────────────────────────────────────────┘
```

### Control Plane

The control plane handles:

* Authentication
* User accounts
* Device registration
* Server discovery
* Server health
* Configuration issuance
* Peer lifecycle
* Key revocation
* Policies
* Administration

The control plane should **not unnecessarily carry user Internet traffic**.

An outage of the control plane should not automatically destroy an already-established VPN tunnel.

### Data Plane

The data plane handles:

* WireGuard tunnels
* Packet forwarding
* NAT
* Firewalling
* DNS forwarding
* Internet traffic

---

# 🔐 Security Model

AegisVPN follows a **zero-trust architecture**.

Nothing is trusted by default.

```text
Client
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
Validated Request
   │
   ▼
Least-Privilege Operation
```

Every request must be:

1. Authenticated
2. Authorized
3. Validated
4. Rate-limited where appropriate
5. Executed with minimum required privileges

A compromised API must **not automatically become unrestricted root access**.

---

# 🔑 Cryptographic Key Management

Each device receives its own WireGuard identity.

```text
Device
  │
  ├── Generate WireGuard key pair
  │
  ├── Private Key → Device only
  │
  └── Public Key → Peer registration
```

Private keys must never be:

* Logged
* Committed to Git
* Exposed through frontend JavaScript
* Included in analytics
* Returned unnecessarily by APIs
* Stored in plaintext unnecessarily
* Exposed to administrators unnecessarily

Where practical, keys should be generated client-side.

AegisVPN supports the lifecycle of:

```text
Generate
   ↓
Provision
   ↓
Active
   ↓
Rotate
   ↓
Revoke
   ↓
Expire
```

---

# 🌐 Real WireGuard Connectivity

AegisVPN uses WireGuard as its primary VPN protocol rather than inventing custom cryptography or a proprietary VPN protocol.

The client must verify the actual tunnel before displaying:

> **CONNECTED**

Verification includes:

* WireGuard interface
* Peer configuration
* Latest handshake
* Tunnel address
* Routing table
* Internet connectivity
* DNS path
* Public IP

The UI must never report a successful VPN connection merely because a configuration was generated.

---

# 🛡️ Leak Protection

## DNS Protection

DNS traffic must follow the VPN's controlled DNS path.

AegisVPN verifies:

* DNS configuration
* DNS reachability
* DNS routing
* DNS leaks
* IPv4 DNS behavior
* IPv6 DNS behavior where supported

The application must report the **actual network state**, not simply whether a "DNS protection" setting is enabled.

---

## IPv4 Protection

When full-tunnel mode is enabled:

```text
IPv4 Traffic
     │
     ▼
WireGuard
     │
     ▼
VPN Server
     │
     ▼
Internet
```

---

## IPv6 Protection

IPv6 is treated as a first-class networking requirement.

```text
IPv6 Traffic
     │
     ├── Safely routed through VPN
     │
     └── OR
          │
          ▼
      Safely blocked
```

AegisVPN must never assume that IPv6 does not exist.

If IPv6 cannot be securely routed through the VPN, it must be handled using a fail-closed strategy.

---

# ☠️ Kill Switch

AegisVPN implements a genuine network-level kill switch.

### Normal operation

```text
Device
   │
   ▼
WireGuard VPN
   │
   ▼
Internet
```

### VPN failure

```text
Device
   │
   ▼
BLOCKED
```

When enabled, the kill switch prevents accidental direct Internet access outside the VPN.

Only the minimum traffic required to establish or restore the VPN should be permitted.

The kill switch is designed to handle:

* VPN server shutdown
* Wi-Fi changes
* Ethernet changes
* Network interruption
* Network restoration
* WireGuard failure
* DNS failure
* Control-plane failure
* Server failover
* Sleep/wake
* Mobile network changes

> **Security takes priority over convenience.**

---

# 🌍 Multi-Server Infrastructure

AegisVPN is designed to support multiple VPN locations.

Example deployment:

```text
                 AegisVPN
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
    India       Singapore      Japan
       │            │            │
       ├────────────┼────────────┤
       ▼            ▼            ▼
   Germany     Netherlands   United Kingdom
       │            │            │
       └────────────┼────────────┘
                    ▼
              United States
```

Locations are **not hard-coded**.

Servers can be registered dynamically.

Each server can expose operational information such as:

* Server ID
* Country
* City
* Endpoint
* Public key
* Capacity
* Current load
* Latency
* Packet loss
* Health
* Available bandwidth
* Active peers
* Software version
* Last health check

---

# ⚡ Smart Server Selection

AegisVPN does not select servers solely based on geographical distance.

Server selection considers:

* Latency
* Packet loss
* Server load
* Capacity
* Reliability
* Geographic distance
* Health status

Conceptually:

```text
Server Score =
    Latency
  + Packet Loss Penalty
  + Load Penalty
  + Health Penalty
```

Unhealthy servers are excluded from automatic selection.

---

# 🔄 Automatic Failover

When a server fails:

```text
Server Failure
      │
      ▼
Detect Failure
      │
      ▼
Mark Unhealthy
      │
      ▼
Select Healthy Server
      │
      ▼
Establish WireGuard Tunnel
      │
      ▼
Verify Handshake
      │
      ▼
Verify Routing
      │
      ▼
Verify Internet
      │
      ▼
Verify DNS
      │
      ▼
Restore Traffic
```

AegisVPN does **not** report failover success until the replacement tunnel has actually been verified.

---

# 📱 Native Client Architecture

The web application manages the control plane.

The actual VPN tunnel is controlled by native clients using the appropriate operating-system networking/VPN APIs.

Target platforms:

| Platform | Support |
| -------- | ------- |
| Linux    | Planned |
| Windows  | Planned |
| macOS    | Planned |
| Android  | Planned |
| iOS      | Planned |

A browser alone is not treated as a full-device VPN implementation.

---

# 🖥️ VPN Client

The client provides a professional interface with real network state.

Example:

```text
┌─────────────────────────────────────┐
│             AegisVPN                │
│                                     │
│             CONNECTED               │
│                                     │
│ Server                              │
│ Germany — Frankfurt                 │
│                                     │
│ Public IP                           │
│ xxx.xxx.xxx.xxx                     │
│                                     │
│ VPN IP                              │
│ 10.x.x.x                            │
│                                     │
│ Latency          XX ms              │
│ Download         XX Mbps            │
│ Upload           XX Mbps            │
│ Connected        XX:XX:XX            │
│                                     │
│          [ DISCONNECT ]              │
└─────────────────────────────────────┘
```

Connection states:

```text
DISCONNECTED
CONNECTING
CONNECTED
RECONNECTING
DISCONNECTING
ERROR
```

These states must always correspond to actual system state.

---

# 🔎 Privacy Diagnostics

AegisVPN provides a privacy diagnostics interface.

It can display:

* Public IPv4
* Public IPv6
* VPN server
* VPN IP
* DNS servers
* DNS leak status
* IPv6 leak status
* Kill switch status
* WireGuard handshake status

Example:

```text
VPN Tunnel       ✓ Protected
IPv4             ✓ Protected
IPv6             ✓ Protected
DNS              ✓ Protected
Kill Switch      ✓ Active
```

Every result should come from an actual diagnostic test.

---

# 📊 Connection Quality

Real measurements are used for:

* Latency
* Packet loss
* Download throughput
* Upload throughput
* Connection duration
* Data transferred

AegisVPN never generates fake performance numbers.

---

# 🔒 Privacy-First Architecture

AegisVPN is designed to minimize the collection of sensitive VPN information.

The architecture should not collect or retain:

* Browsing history
* URLs
* HTTP contents
* Packet contents
* DNS query history
* Application traffic contents

Operational telemetry should be limited to what is genuinely necessary for security and reliability.

For every operational log, define:

```text
What is logged?
Why is it logged?
How long is it retained?
Who can access it?
```

No telemetry should be silently introduced.

---

# 👤 Device Management

Users can manage their VPN devices.

Each device may have:

* Device name
* Platform
* VPN key identity
* Creation time
* Last connection
* Last handshake
* Current server
* Status

Users can:

* Add devices
* Rename devices
* Revoke devices
* Regenerate credentials
* View connection status

When a device is revoked, its VPN access must be revoked as quickly as the architecture permits.

---

# 👮 Role-Based Access Control

AegisVPN supports granular administrative roles:

```text
User
  │
  ▼
Support
  │
  ▼
Network Operator
  │
  ▼
Security Operator
  │
  ▼
Administrator
  │
  ▼
Super Administrator
```

Every role receives only the permissions required for its responsibilities.

Administrative security-sensitive actions generate audit events.

---

# 🗄️ Database

The control plane uses **PostgreSQL**.

Core entities include:

```text
users
devices
vpn_servers
vpn_peers
sessions
server_metrics
security_events
audit_events
subscriptions
```

The database design uses:

* UUIDs
* Foreign keys
* Unique constraints
* Indexes
* Timestamps
* Transactions
* Appropriate cascading rules

Sensitive information is not stored unless there is a clear operational requirement.

---

# 🔐 Secret Management

Secrets must never be hard-coded.

Production deployments should use appropriate secure secret-management mechanisms.

Never commit:

```text
API Keys
Database Passwords
Private Keys
JWT Secrets
Signing Keys
Server Credentials
```

Development, staging, and production credentials must remain separated.

---

# 🚫 Privileged Operations

AegisVPN must never expose arbitrary shell execution through the web application.

If privileged Linux networking operations are required, they should be isolated behind a dedicated VPN management service.

The management service should use:

* Command allowlists
* Parameter validation
* Dedicated service accounts
* Minimal sudo permissions
* No arbitrary command endpoint
* No shell interpolation
* No user-controlled shell arguments

---

# 🌐 API

AegisVPN exposes a documented API for control-plane operations.

API areas include:

```text
Authentication
Users
Devices
Servers
Peer Management
VPN Configuration
Connection Status
Health
Diagnostics
Administration
```

The API uses:

* Input schemas
* Versioned endpoints
* Consistent error responses
* Authentication
* Authorization
* Rate limiting
* Security headers
* Strict CORS where applicable
* CSRF protections where applicable

OpenAPI documentation should be generated for supported endpoints.

---

# 📈 Observability

Infrastructure observability focuses on system health without recording user browsing activity.

Monitor:

* CPU
* Memory
* Disk
* Network utilization
* Packet loss
* Latency
* API latency
* Error rates
* Database health
* WireGuard health
* Active peers
* Server availability

Do **not** monitor:

* URLs
* DNS history
* Browsing destinations
* Packet contents

---

# 🧪 Security Testing

Security is treated as a continuous engineering requirement.

### Authentication

Test:

* Brute-force resistance
* Session security
* Token theft
* Password security
* Account enumeration

### API

Test:

* SQL injection
* XSS
* CSRF
* SSRF
* Command injection
* Path traversal
* Broken access control
* IDOR
* Rate-limit bypass

### Infrastructure

Test:

* Firewall configuration
* SSH security
* Privilege boundaries
* Secret exposure
* Service isolation

### VPN

Test:

* DNS leaks
* IPv4 leaks
* IPv6 leaks
* Routing leaks
* Kill-switch bypasses
* Reconnection
* Server failover
* Peer revocation

---

# 💥 Failure-First Engineering

AegisVPN assumes that components will fail.

Test failures including:

```text
VPN server dies
API dies
Database dies
DNS dies
Network disappears
Wi-Fi changes
WireGuard crashes
Server overload
Client crashes
Laptop sleeps
Mobile network changes
Credentials are revoked
```

Every failure scenario should define:

```text
EXPECTED STATE
      +
RECOVERY BEHAVIOR
      +
SECURITY BEHAVIOR
```

If there is uncertainty, AegisVPN should prefer:

> **Fail closed rather than leak traffic.**

---

# 🧠 Privacy Threat Model

A VPN is a privacy tool, not a magical anonymity system.

## What AegisVPN can protect against

Depending on configuration and deployment:

* Local network observers seeing ordinary Internet destinations directly
* ISP-level visibility into final destinations in the normal VPN model
* Websites seeing the user's original public IP
* Interception between client and VPN server when properly configured

## What AegisVPN cannot automatically protect against

* Account-based identification
* Cookies
* Browser fingerprinting
* Malware
* Device compromise
* A compromised endpoint
* Information voluntarily provided to websites
* A malicious or compromised VPN server
* Legal/administrative access to infrastructure
* Global traffic-correlation attacks

### Therefore, AegisVPN does NOT claim:

❌ "100% anonymous"

❌ "Impossible to trace"

❌ "Completely invisible"

❌ "Unhackable"

Instead:

> **AegisVPN is designed to provide strong network privacy and secure traffic transport while clearly communicating the limitations of VPN technology.**

---

# 🏥 Security Philosophy

AegisVPN follows a simple hierarchy:

```text
             SECURITY
                ▲
                │
             PRIVACY
                ▲
                │
           RELIABILITY
                ▲
                │
           CORRECTNESS
                ▲
                │
           PERFORMANCE
                ▲
                │
           CONVENIENCE
```

Security takes priority over convenience.

A flashy feature that weakens the security model should not be implemented.

---

# 📦 Development Roadmap

Development follows controlled phases.

### Phase 1 — Architecture

* Architecture
* Threat model
* Security model

### Phase 2 — Control Plane

* Database
* Authentication
* Authorization

### Phase 3 — VPN Infrastructure

* Server provisioning
* WireGuard infrastructure

### Phase 4 — Peer Management

* Device identities
* Peer lifecycle
* Key management

### Phase 5 — Real VPN

* Tunnel establishment
* Routing
* Connectivity verification

### Phase 6 — Network Security

* NAT
* Firewall
* DNS
* IPv6
* Kill switch

### Phase 7 — Reliability

* Multi-server architecture
* Server selection
* Automatic failover

### Phase 8 — Clients

* Linux
* Windows
* macOS
* Android
* iOS

### Phase 9 — Operations

* Monitoring
* Observability
* Alerting

### Phase 10 — Validation

* Security testing
* Network testing
* Failure testing
* Performance testing
* End-to-end testing

### Phase 11 — Production

* Hardened deployment
* Documentation
* Disaster recovery
* Rollback procedures

---

# ✅ Production Acceptance Criteria

AegisVPN is **not considered production-ready simply because the interface looks complete**.

The following must be verified:

* [ ] Real WireGuard tunnel works
* [ ] Real Internet traffic passes through VPN
* [ ] Public IP changes correctly
* [ ] DNS is correctly routed
* [ ] IPv4 leaks are prevented
* [ ] IPv6 leaks are prevented or safely blocked
* [ ] Kill switch actually works
* [ ] Device revocation works
* [ ] Server health detection works
* [ ] Server failover works
* [ ] Connection status reflects reality
* [ ] Private keys are protected
* [ ] Administrative privileges are minimized
* [ ] API security has been tested
* [ ] Infrastructure is hardened
* [ ] Automated tests pass
* [ ] Failure scenarios are tested
* [ ] Documentation exists
* [ ] No fake security claims exist

---

# 🧪 No Fake Features

AegisVPN follows one strict rule:

> **If it isn't actually implemented and verified, it must not be presented as working.**

Never fake:

* VPN connections
* WireGuard handshakes
* Encryption
* Bandwidth
* Latency
* Public IP
* DNS protection
* Kill switch
* Server status
* Security features

Instead display:

```text
NOT IMPLEMENTED
```

or

```text
UNAVAILABLE
```

when appropriate.

---

# 📚 Documentation

The project should maintain documentation for:

```text
README
Architecture
Threat Model
Security Model
API Documentation
Database Schema
VPN Server Setup
Client Setup
Deployment Guide
Monitoring
Troubleshooting
Disaster Recovery
Privacy Policy
Security Policy
Development Guide
```

Important architecture diagrams should cover:

```text
Client → VPN → Internet

Control Plane vs Data Plane

Server Failover

Key Lifecycle

DNS Flow

Kill Switch Flow
```

---

# 🚀 Production Deployment Philosophy

Before production deployment:

1. Harden every server.
2. Validate firewall rules.
3. Validate WireGuard configuration.
4. Test routing.
5. Test NAT.
6. Test DNS.
7. Test IPv4.
8. Test IPv6.
9. Test kill switch.
10. Test reconnection.
11. Test server failure.
12. Test peer revocation.
13. Test control-plane failure.
14. Test monitoring.
15. Test backups and restoration.
16. Run security tests.
17. Run performance tests.
18. Perform final review.

Only after successful verification should a feature be considered production-ready.

---

# 🤝 Contributing

Contributions are welcome.

Before submitting a change:

* Follow the existing architecture.
* Avoid unnecessary complexity.
* Never introduce custom cryptography.
* Never expose secrets.
* Add tests for security-sensitive changes.
* Do not introduce privacy-invasive telemetry.
* Document security implications.
* Test failure scenarios where applicable.

Security-sensitive changes should receive additional review.

---

# 🔐 Responsible Security Disclosure

If you discover a security vulnerability, do not publicly disclose exploit details before the maintainers have had an opportunity to investigate and remediate the issue.

A dedicated security policy and private vulnerability-reporting process should be established before production launch.

---

# 📜 License

Choose an appropriate open-source or proprietary license before publishing the project.

> **Do not assume a license merely because the repository is public.**

---

# ⚠️ Important Disclaimer

AegisVPN is designed to improve network privacy and security.

It does **not** guarantee:

* Complete anonymity
* Absolute untraceability
* Perfect security
* Protection against compromised devices
* Protection against malware
* Protection against browser fingerprinting
* Protection against account-based identification
* Protection against a malicious VPN endpoint
* Protection against global traffic analysis

No VPN can honestly make all of those guarantees.

---

# 🎯 Project Goal

AegisVPN aims to be a **technically honest, security-first, privacy-focused VPN platform**.

The goal is not to build the VPN with the most flashy features.

The goal is to build one that:

```text
       DOES WHAT IT CLAIMS
                │
                ▼
       VERIFIES WHAT IT DOES
                │
                ▼
       FAILS SAFELY WHEN IT CAN'T
                │
                ▼
       PROTECTS USER PRIVACY
                │
                ▼
       NEVER FAKES SECURITY
```

> **Security first. Privacy second. Reliability third. Performance fourth. Convenience last.**

---

## Built with WireGuard

AegisVPN uses WireGuard as its primary VPN protocol rather than attempting to create its own cryptographic protocol.

**Real tunnels. Real routing. Real verification. Real failure handling.**

**No fake VPN. No fake security. No impossible anonymity promises.**
