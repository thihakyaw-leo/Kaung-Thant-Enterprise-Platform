import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  updatedAt: number;
}

const API_URL = '/api/master/settings';

export function useSettings() {
  return useQuery<SystemSetting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get(API_URL);
      return data.data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const { data } = await api.patch(API_URL, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
