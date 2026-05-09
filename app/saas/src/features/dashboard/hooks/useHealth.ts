import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

// FIX #9: Updated interface to match actual API response from /api/master/health
// Old interface had wrong field names (status: 'online'/'offline', wrong services keys)

export interface ServiceStatus {
  status: 'operational' | 'degraded' | 'outage';
  latency?: string;
  uptime?: string;
  queryTime?: string;
  connections?: number;
  hitRate?: string;
  size?: string;
  throughput?: string;
  availability?: string;
}

export interface TrafficRegion {
  region: string;
  load: number;
}

export interface SystemHealth {
  status: 'operational' | 'degraded' | 'outage';
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    storage: ServiceStatus;
    cache: ServiceStatus;
  };
  metrics: {
    cpu: number;
    memory: number;
    requestsPerSecond: number;
    errorRate: string;
    totalTenants: number;
    activeUsers: number;
  };
  traffic: TrafficRegion[];
  timestamp: number;
}

const API_URL = '/api/master/health';

export function useHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get(API_URL);
      return data.data as SystemHealth;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
