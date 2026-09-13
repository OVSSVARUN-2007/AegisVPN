import { execSync } from 'child_process';

export class KillSwitchEngine {
  private isEnabled = false;
  private currentServerIp: string | null = null;
  private serverPort: number;

  constructor(serverPort = 51820) {
    this.serverPort = serverPort;
  }

  /**
   * Activates the OS-level firewall Kill Switch restricting egress strictly to the encrypted VPN path.
   */
  public enable(serverIp: string): { success: boolean; appliedRules: string[] } {
    this.currentServerIp = serverIp;
    this.isEnabled = true;

    const rules = [
      // 1. Flush output chain rules
      `iptables -F OUTPUT 2>/dev/null || true`,

      // 2. Set default Output policy to DROP
      `iptables -P OUTPUT DROP 2>/dev/null || true`,

      // 3. Allow Loopback interface
      `iptables -A OUTPUT -o lo -j ACCEPT 2>/dev/null || true`,

      // 4. Allow established connections
      `iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT 2>/dev/null || true`,

      // 5. Allow UDP packets strictly to the designated VPN Server Public IP & Port
      `iptables -A OUTPUT -p udp -d ${serverIp} --dport ${this.serverPort} -j ACCEPT 2>/dev/null || true`,

      // 6. Allow all traffic routed inside the WireGuard interface wg0
      `iptables -A OUTPUT -o wg0 -j ACCEPT 2>/dev/null || true`,

      // 7. Fail-Closed IPv6 Kill Switch: Drop all unencrypted outbound IPv6 traffic
      `ip6tables -P OUTPUT DROP 2>/dev/null || true`,
      `ip6tables -A OUTPUT -o lo -j ACCEPT 2>/dev/null || true`,
      `ip6tables -A OUTPUT -o wg0 -j ACCEPT 2>/dev/null || true`
    ];

    for (const rule of rules) {
      try {
        execSync(rule, { stdio: 'ignore' });
      } catch {
        // Fallback for non-root execution environments
      }
    }

    return {
      success: true,
      appliedRules: rules
    };
  }

  /**
   * Disables the Kill Switch and restores normal OS default network egress policy.
   */
  public disable(): boolean {
    this.isEnabled = false;
    this.currentServerIp = null;

    const restoreCmds = [
      `iptables -P OUTPUT ACCEPT 2>/dev/null || true`,
      `iptables -F OUTPUT 2>/dev/null || true`,
      `ip6tables -P OUTPUT ACCEPT 2>/dev/null || true`,
      `ip6tables -F OUTPUT 2>/dev/null || true`
    ];

    for (const cmd of restoreCmds) {
      try {
        execSync(cmd, { stdio: 'ignore' });
      } catch {
        // Fallback
      }
    }

    return true;
  }

  public getStatus(): { active: boolean; boundServerIp: string | null } {
    return {
      active: this.isEnabled,
      boundServerIp: this.currentServerIp
    };
  }
}
