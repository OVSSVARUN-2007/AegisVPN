import { Request, Response } from 'express';
import { LeakDetectionService } from '../services/leakDetectionService.js';

export class DiagnosticsController {
  public static async runLeakTest(req: Request, res: Response): Promise<void> {
    let clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7);
    }

    // Allow simulated test IP query param for leak protection validation tests
    if (req.query.testIp && typeof req.query.testIp === 'string') {
      clientIp = req.query.testIp;
    }

    const report = LeakDetectionService.runDiagnostic(clientIp);
    res.json(report);
  }
}
