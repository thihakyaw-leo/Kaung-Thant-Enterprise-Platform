import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../lib/api';

export interface Subscription {
  id: string;
  tenantName: string;
  subdomain: string;
  planName: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'suspended' | 'expired';
  autoRenew: boolean;
}

export interface BillingStats {
  totalRevenue: number;
  unpaidCount: number;
  tenantCount: number;
  mrr: number;
  avgRevenuePerTenant: number;
  distribution: {
    plan: string;
    count: number;
  }[];
}

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  updatedAt: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  maxUsers: number;
  maxProducts: number;
  features: string; // JSON
}

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/subscriptions');
      return data.data as Subscription[];
    },
  });
};

export const useBillingStats = () => {
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/billing/stats');
      return data.data as BillingStats;
    },
  });
};

export const usePricingPlans = () => {
  return useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/pricing-plans');
      return data.data as PricingPlan[];
    },
  });
};

// FIX #4: Was calling PATCH /pricing-plans/:id which didn't exist in API
// Now correctly hits the new PATCH /pricing-plans/:id endpoint
export const useUpdatePricingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<PricingPlan> }) => {
      const { data } = await api.patch(`/api/master/pricing-plans/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });
};

export const useCreatePricingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPlan: Omit<PricingPlan, 'id'>) => {
      const { data } = await api.post('/api/master/billing/plans', newPlan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });
};

export const useDeletePricingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/master/pricing-plans/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
  });
};
export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/settings');
      return data.data as SystemSetting[];
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { key: string, value: string }[]) => {
      const { data } = await api.patch('/api/master/settings', updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });
};

/**
 * INVOICES (FIX #5: new hook connecting to real invoices table via GET /billing/invoices)
 */
export interface Invoice {
  id: string;
  tenantName: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  issuedDate: number;
  dueDate: number;
  paidDate?: number;
}

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/billing/invoices');
      return data.data as Invoice[];
    },
  });
};
