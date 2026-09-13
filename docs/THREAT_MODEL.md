# AegisVPN Threat Model & Privacy Guarantees

## 1. Executive Summary
AegisVPN provides robust network-level privacy, strong WireGuard encryption, and defense against network surveillance. However, security and privacy must be evaluated accurately without misleading claims. AegisVPN explicitly distinguishes between **Privacy Protection** (encrypting transit and masking public IP) and **Total Anonymity** (which no VPN can guarantee alone).

---

## 2. Threat Matrix

| Adversary / Threat Actor | Threat Description | AegisVPN Protection Status | Technical Mitigation |
| :--- | :--- | :--- | :--- |
| **Local Wi-Fi Eavesdropper / Rogue AP** | Intercepting unencrypted HTTP / DNS / TCP traffic on public networks. | **FULLY PROTECTED** | 100% of IP traffic is encapsulated in modern ChaCha20-Poly1305 WireGuard tunnels. |
| **Internet Service Provider (ISP)** | Tracking destination domains, DNS requests, and building browsing profiles. | **FULLY PROTECTED** | All DNS and IP traffic is directed inside the WireGuard tunnel. ISP sees only UDP packets to AegisVPN server IP. |
| **DNS Leak / Hijacking** | Operating system sending unencrypted DNS queries outside the VPN adapter. | **FULLY PROTECTED** | Controlled DNS path (`10.8.0.1`), OS DNS override, and automated DNS leak detection engine. |
| **IPv6 Bypass Leak** | Unencrypted IPv6 traffic leaking past an IPv4-only VPN tunnel. | **FULLY PROTECTED** | Dual-stack IPv4/IPv6 WireGuard tunneling or OS-level IPv6 blackhole drop rules (`iptables`/`nftables`). |
| **Unexpected Tunnel Disconnect** | Network drop or WireGuard process crash exposing unprotected connection. | **FULLY PROTECTED** | OS-level firewall Kill Switch blocks all outbound traffic except encrypted WireGuard UDP packets to server endpoint. |
| **Ad Networks & Web Trackers** | Fingerprinting browser settings, canvas, cookies, active user login sessions. | **NOT COVERED BY VPN ALONE** | Web trackers use application-level storage. Users should combine VPN with ad-blockers and privacy-focused browsers. |
| **Malware & Endpoint Compromise** | Keyloggers, Trojan viruses, or compromised OS binaries on client host. | **NOT COVERED BY VPN ALONE** | AegisVPN secures network transit. Device security relies on OS patches and endpoint protection. |
| **Global Traffic Correlation** | State-level adversary monitoring timing and packet size at both entry and exit nodes simultaneously. | **OUTSIDE VPN SCOPE** | VPNs route through single hops or multi-hop relays; statistical traffic correlation across global backbones cannot be completely eliminated. |

---

## 3. Explicit Privacy Guarantees vs Non-Claims

### What AegisVPN Protects:
- Hides your real IPv4 and IPv6 address from visited websites and services.
- Encrypts all internet traffic between your device and the VPN exit node.
- Prevents local network operators, ISPs, and coffee-shop Wi-Fi snoops from monitoring your destination IP addresses or domain names.
- Eliminates DNS hijacking and unencrypted DNS query exposure.
- Enforces fail-closed protection via a real OS network kill switch.

### What AegisVPN Does NOT Claim:
- **No "100% Anonymity"**: A VPN does not hide your identity if you sign into personal Google/Facebook accounts or voluntarily share identifying data.
- **No "Unhackable" Guarantee**: No software is mathematically immune to all vulnerabilities; AegisVPN employs defense-in-depth, zero-trust controls, and continuous security audits.
- **No Anti-Fingerprinting Miracle**: Browser fingerprinting (screen resolution, fonts, cookies) operates at Layer 7 (Application) and is unaffected by Layer 3/4 network encryption.
