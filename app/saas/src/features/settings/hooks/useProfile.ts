import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export interface SaaSUserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: number;
}

export function useProfile() {
  return useQuery<SaaSUserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/me');
      return data.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<SaaSUserProfile>) => {
      const { data } = await api.patch('/api/master/me', updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.patch('/api/master/me/password', payload);
      return data.data;
    },
  });
}
