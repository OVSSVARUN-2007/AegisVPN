import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'aegisvpn-super-secret-jwt-key-change-in-production-32bytes',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'aegisvpn-refresh-secret-jwt-key-change-in-production-32bytes',
  jwtAccessExpiry: '15m',
  jwtRefreshExpiry: '7d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'aegisvpn',
  },
  wireguard: {
    ipv4Subnet: '10.8.0.0/16',
    ipv6Subnet: 'fd42:42:42::/64',
    defaultPort: 51820,
    dnsServer: '10.8.0.1',
  }
};
