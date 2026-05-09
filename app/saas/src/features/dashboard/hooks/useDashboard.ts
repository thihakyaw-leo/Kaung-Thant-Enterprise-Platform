import { useQuery } from '@tanstack/react-query';

// FIX #7: baseURL was '/api/v1/saas' (wrong - tenant API). Now correctly points to master admin API.
import { api } from '../../../lib/api';

export interface AnalyticsDashboard {
  revenue: { month: string; total: number }[];
  growth: { month: string; count: number }[];
  churn: { status: string; count: number }[];
  summary: {
    mrr: number;
    arr: number;
    activeTenants: number;
  };
}

/**
 * Real analytics data from /api/master/analytics/dashboard
 * Queries invoices, tenants, subscriptions tables in DB_MASTER
 */
export const useAnalyticsDashboard = () => {
  return useQuery<AnalyticsDashboard>({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/analytics/dashboard');
      return data.data as AnalyticsDashboard;
    },
  });
};
