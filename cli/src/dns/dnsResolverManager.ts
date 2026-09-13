import fs from 'fs';
import { execSync } from 'child_process';

export class DnsResolverManager {
  private backupResolvConf = '/tmp/resolv.conf.aegis.backup';

  /**
   * Overrides system DNS to route via local AegisVPN DNS resolver (10.8.0.1).
   */
  public setVpnDns(dnsServer = '10.8.0.1'): boolean {
    try {
      if (fs.existsSync('/etc/resolv.conf')) {
        fs.copyFileSync('/etc/resolv.conf', this.backupResolvConf);
      }
      fs.writeFileSync('/etc/resolv.conf', `nameserver ${dnsServer}\nnameserver 1.1.1.1\n`);
      return true;
    } catch {
      // Fallback for non-root execution
      return false;
    }
  }

  /**
   * Restores system DNS settings from backup.
   */
  public restoreDns(): boolean {
    try {
      if (fs.existsSync(this.backupResolvConf)) {
        fs.copyFileSync(this.backupResolvConf, '/etc/resolv.conf');
        fs.unlinkSync(this.backupResolvConf);
      }
      return true;
    } catch {
      return false;
    }
  }
}
