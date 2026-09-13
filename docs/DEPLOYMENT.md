# AegisVPN Infrastructure Hardening & Deployment Guide

## 1. System Requirements & OS Hardening
Every AegisVPN server node should run a minimal installation of Ubuntu 24.04 LTS or Debian 12 with Linux kernel $\ge 5.6$ (native kernel WireGuard module).

### 1.1 SSH & Sysctl Hardening
Modify `/etc/ssh/sshd_config`:
```ini
PermitRootLogin no
PasswordAuthentication no
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

Modify `/etc/sysctl.d/99-aegisvpn.conf`:
```ini
# Enable IPv4 and IPv6 Packet Forwarding
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1

# Disable IP Source Routing & ICMP Redirects
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Enable TCP SYN Cookies
net.ipv4.tcp_syncookies = 1
```
Apply settings: `sysctl -p /etc/sysctl.d/99-aegisvpn.conf`

---

## 2. Firewall Architecture (`iptables` / `nftables`)

AegisVPN nodes enforce explicit allow rules and drop all unexpected inbound/forwarding packets by default.

### 2.1 Firewall Rules Script (`/usr/local/bin/aegis-firewall.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

WAN_IF="eth0"
WG_IF="wg0"
WG_PORT=51820

# 1. Flush existing rules
iptables -F
iptables -t nat -F
iptables -X

# 2. Default Policies (Drop unexpected traffic)
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 3. Allow Loopback & Established Connections
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 4. Allow SSH (Port 22) and WireGuard (UDP Port 51820)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p udp --dport $WG_PORT -j ACCEPT

# 5. Allow DNS queries to local resolver from WireGuard interface only
iptables -A INPUT -i $WG_IF -p udp --dport 53 -j ACCEPT
iptables -A INPUT -i $WG_IF -p tcp --dport 53 -j ACCEPT

# 6. Enable NAT / MASQUERADE for VPN tunnel traffic going out to Internet
iptables -t nat -A POSTROUTING -o $WAN_IF -j MASQUERADE

# 7. Permit Forwarding from WireGuard interface out to WAN
iptables -A FORWARD -i $WG_IF -o $WAN_IF -j ACCEPT
iptables -A FORWARD -i $WAN_IF -o $WG_IF -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 8. IPv6 Security Rule: If IPv6 internet routing is disabled, drop unencrypted outbound IPv6
ip6tables -P INPUT DROP
ip6tables -P FORWARD DROP
ip6tables -A INPUT -i lo -j ACCEPT
```

---

## 3. Systemd Service Unit (`aegis-agent.service`)

Create `/etc/systemd/system/aegis-agent.service`:
```ini
[Unit]
Description=AegisVPN Server Node Agent & Health Reporter
After=network.target wireguard.service

[Service]
Type=simple
User=aegisvpn
WorkingDirectory=/opt/aegisvpn/server-node
ExecStart=/usr/bin/node dist/agent.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=CONTROL_PLANE_URL=https://api.aegisvpn.com

[Install]
WantedBy=multi-user.target
```
Enable & start: `systemctl enable --now aegis-agent.service`
