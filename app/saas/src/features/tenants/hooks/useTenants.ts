import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../lib/api';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  d1_database_id: string;
  plan_id: string;
  status: 'active' | 'suspended';
  ownerUsername?: string;
  ownerPassword?: string;
  managerUsername?: string;
  managerPassword?: string;
  cashierUsername?: string;
  cashierPassword?: string;
  createdAt: number;
}

export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/tenants');
      return data.data as Tenant[];
    },
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTenant: { name: string, subdomain: string, planId: string }) => {
      const { data } = await api.post('/api/master/tenants', newTenant);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Tenant> }) => {
      await api.patch(`/api/master/tenants/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

export const useUpdateTenantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/api/master/tenants/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/master/tenants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
};
