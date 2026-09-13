import os from 'os';

export interface SystemMetrics {
  cpuPct: number;
  memoryPct: number;
  freeMemMb: number;
  totalMemMb: number;
  uptimeSeconds: number;
  loadAvg: number[];
}

export class MetricsCollector {
  public static collectSystemMetrics(): SystemMetrics {
    const totalMemMb = Math.round(os.totalmem() / (1024 * 1024));
    const freeMemMb = Math.round(os.freemem() / (1024 * 1024));
    const memoryPct = Math.round(((totalMemMb - freeMemMb) / totalMemMb) * 100);

    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }
    const idlePct = totalTick > 0 ? (totalIdle / totalTick) * 100 : 80;
    const cpuPct = Math.round(100 - idlePct);

    return {
      cpuPct: Math.min(100, Math.max(0, cpuPct)),
      memoryPct,
      freeMemMb,
      totalMemMb,
      uptimeSeconds: Math.round(os.uptime()),
      loadAvg: os.loadavg()
    };
  }
}
