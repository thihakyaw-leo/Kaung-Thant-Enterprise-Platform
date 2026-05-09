import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../lib/api';

export type AuditLogStatus = 'success' | 'warning' | 'failed';

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  ip_address: string;
  status: AuditLogStatus;
  metadata: string | null;
  created_at: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogsFilters {
  page?: number;
  limit?: number;
  status?: AuditLogStatus | '';
  q?: string;
}

export const useAuditLogs = (filters: AuditLogsFilters = {}) => {
  const { page = 1, limit = 20, status, q } = filters;

  return useQuery({
    queryKey: ['audit-logs', page, limit, status, q],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status) params.set('status', status);
      if (q && q.trim()) params.set('q', q.trim());

      const { data } = await api.get<{ success: boolean; data: AuditLogsResponse }>(
        `/audit-logs?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 30_000, // Audit logs refresh every 30s
  });
};

export interface WriteAuditLogPayload {
  action: string;
  actor: string;
  target: string;
  ipAddress?: string;
  status?: AuditLogStatus;
  metadata?: string;
}

export const useWriteAuditLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WriteAuditLogPayload) => {
      const { data } = await api.post('/api/master/audit-logs', payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate so SecurityCompliancePage refreshes immediately
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};
