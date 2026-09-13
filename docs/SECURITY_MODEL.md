# AegisVPN Security Model & Zero-Trust Architecture

## 1. Authentication & Password Security
- **Argon2id Hashing**: Passwords are hashed using the state-of-the-art Argon2id algorithm:
  - Memory cost ($m$): $65536\text{ KiB}$ (64 MB)
  - Time cost ($t$): $3\text{ iterations}$
  - Parallelism ($p$): $4\text{ threads}$
- **Brute-Force & Lockout Protection**: API endpoints enforce strict rate limiting (max 5 failed login attempts per IP per 15-minute window).
- **Session Tokens**: JWT Access Tokens expire in 15 minutes. Refresh Tokens are rotated upon every single renewal and bound to device session UUIDs stored in the database.

---

## 2. Cryptographic Key Management
- **Curve25519 Elliptic Curve**: Used for WireGuard asymmetric keypairs.
- **Client-Side Generation**: Private keys are generated locally using high-entropy CSPRNG (`crypto.getRandomValues()` / Node `crypto.generateKeyPairSync('x25519')`).
- **Zero Private Key Exposure**: Private keys are **never** transmitted across the network, sent to the Control Plane API, logged in application logs, or committed to code repositories.
- **Immediate Revocation**: Calling `/api/v1/devices/:id/revoke` invalidates the device record and triggers a real-time sync event instructing all VPN server agents to remove the peer's public key from `wg0`.

---

## 3. Role-Based Access Control (RBAC)

The system enforces strict permission checks on all Control Plane endpoints across 6 defined roles:

| Role | Permissions |
| :--- | :--- |
| **User** | Manage own account, add/revoke own devices, view server list, fetch own WireGuard configs. |
| **Support** | View server status and assist users with non-cryptographic account issues. Cannot view user keys or audit logs. |
| **Network Operator** | View detailed server metrics, drain server nodes for maintenance, register new VPN nodes. |
| **Security Operator** | Inspect security audit events, review rate limiting metrics, and monitor threat alerts. |
| **Administrator** | Full read/write access to user management, device revocation, server cluster configuration, and RBAC roles. |
| **Super Administrator** | Master system control, secret rotation management, and full system backup authority. |

---

## 4. API Security Controls
- **Helmet Headers**: `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Strict CORS & Input Validation**: All API request bodies and query parameters are parsed and sanitized using `Zod` schemas before execution.
- **SQL Injection Prevention**: 100% of database queries use parameterized SQL prepared statements.
- **No Command Injection**: OS operations on VPN server nodes execute strictly through pre-compiled binary wrappers or parameterized arrays without shell string interpolation.
