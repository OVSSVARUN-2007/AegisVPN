import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { DeviceController } from '../controllers/deviceController.js';
import { ServerController } from '../controllers/serverController.js';
import { PeerController } from '../controllers/peerController.js';
import { AdminController } from '../controllers/adminController.js';
import { DiagnosticsController } from '../controllers/diagnosticsController.js';
import { authenticateJwt } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { authRateLimiter, apiRateLimiter } from '../middleware/rateLimiter.js';

export const router = Router();

// Public Auth Endpoints
router.post('/auth/register', authRateLimiter, AuthController.register);
router.post('/auth/login', authRateLimiter, AuthController.login);
router.get('/auth/me', authenticateJwt, AuthController.me);

// Server Endpoints
router.get('/servers', apiRateLimiter, ServerController.listServers);
router.get('/servers/smart-select', apiRateLimiter, ServerController.smartSelect);
router.post('/servers/metrics', ServerController.updateServerMetrics);
router.post('/servers/failover', ServerController.triggerFailover);

// Device Endpoints (Authenticated Users)
router.get('/devices', authenticateJwt, DeviceController.listDevices);
router.post('/devices', authenticateJwt, DeviceController.registerDevice);
router.post('/devices/:id/revoke', authenticateJwt, DeviceController.revokeDevice);

// Peer Config Endpoints (Authenticated Users)
router.post('/peers/config', authenticateJwt, PeerController.generateConfig);

// Diagnostics Endpoints
router.get('/diagnostics/leak-test', DiagnosticsController.runLeakTest);

// Admin RBAC Endpoints (Admin or SuperAdmin)
router.get('/admin/users', authenticateJwt, requireRole(['Admin', 'SuperAdmin']), AdminController.listUsers);
router.post('/admin/users/role', authenticateJwt, requireRole(['SuperAdmin']), AdminController.updateUserRole);
router.post('/admin/servers', authenticateJwt, requireRole(['NetworkOperator', 'Admin', 'SuperAdmin']), AdminController.addServer);
router.get('/admin/audit-logs', authenticateJwt, requireRole(['SecurityOperator', 'Admin', 'SuperAdmin']), AdminController.getAuditLogs);
