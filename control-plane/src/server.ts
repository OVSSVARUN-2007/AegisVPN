import { app } from './app.js';
import { config } from './config/index.js';

app.listen(config.port, () => {
  console.log(`🚀 AegisVPN Control Plane API running on http://localhost:${config.port}/api/v1`);
  console.log(`🛡️  Zero-Trust Security & WireGuard Key Management Engine initialized.`);
});
