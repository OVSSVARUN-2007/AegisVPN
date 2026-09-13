import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient, VpnServer, UserDevice, LeakReport } from '../api/client';

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';

interface VpnContextType {
  token: string | null;
  user: any | null;
  connectionState: ConnectionState;
  activeServer: VpnServer | null;
  servers: VpnServer[];
  devices: UserDevice[];
  killSwitchActive: boolean;
  leakReport: LeakReport | null;
  connect: (server?: VpnServer) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleKillSwitch: (active: boolean) => void;
  refreshServers: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  runLeakTest: (ip?: string) => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<void>;
}

const VpnContext = createContext<VpnContextType | undefined>(undefined);

export const VpnProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
  const [activeServer, setActiveServer] = useState<VpnServer | null>(null);
  const [servers, setServers] = useState<VpnServer[]>([]);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(true);
  const [leakReport, setLeakReport] = useState<LeakReport | null>(null);

  // Auto authenticate as default user
  useEffect(() => {
    ApiClient.login('admin@aegisvpn.com', 'AdminPass123!').then(res => {
      setToken(res.accessToken);
      setUser(res.user);
      refreshServers();
      refreshDevices(res.accessToken);
      runLeakTest();
    }).catch(err => console.warn('Auto auth error:', err));
  }, []);

  const refreshServers = async () => {
    try {
      const data = await ApiClient.getServers();
      setServers(data.servers);
      if (!activeServer && data.servers.length > 0) {
        setActiveServer(data.servers[0]); // Default to Frankfurt or Mumbai node
      }
    } catch (err) {
      console.warn('Error fetching servers:', err);
    }
  };

  const refreshDevices = async (authToken?: string) => {
    const t = authToken || token;
    if (!t) return;
    try {
      const data = await ApiClient.getDevices(t);
      setDevices(data.devices);
    } catch (err) {
      console.warn('Error fetching devices:', err);
    }
  };

  const runLeakTest = async (ip?: string) => {
    try {
      const targetIp = ip || (connectionState === 'Connected' && activeServer ? activeServer.public_ip : undefined);
      const report = await ApiClient.runLeakTest(targetIp);
      setLeakReport(report);
    } catch (err) {
      console.warn('Leak test error:', err);
    }
  };

  const connect = async (targetServer?: VpnServer) => {
    setConnectionState('Connecting');
    const serverToUse = targetServer || activeServer || servers[0];
    setActiveServer(serverToUse);

    // Simulate real WireGuard handshake delay
    await new Promise(r => setTimeout(r, 1200));

    setConnectionState('Connected');
    runLeakTest(serverToUse.public_ip);
  };

  const disconnect = async () => {
    setConnectionState('Disconnected');
    runLeakTest();
  };

  const toggleKillSwitch = (active: boolean) => {
    setKillSwitchActive(active);
  };

  const revokeDevice = async (deviceId: string) => {
    if (!token) return;
    await ApiClient.revokeDevice(token, deviceId);
    await refreshDevices(token);
  };

  return (
    <VpnContext.Provider
      value={{
        token,
        user,
        connectionState,
        activeServer,
        servers,
        devices,
        killSwitchActive,
        leakReport,
        connect,
        disconnect,
        toggleKillSwitch,
        refreshServers,
        refreshDevices,
        runLeakTest,
        revokeDevice
      }}
    >
      {children}
    </VpnContext.Provider>
  );
};

export const useVpn = () => {
  const context = useContext(VpnContext);
  if (!context) throw new Error('useVpn must be used within VpnProvider');
  return context;
};
