import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../lib/api';

export interface SaasUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'suspended';
  permissions?: string; // JSON string of string[]
  lastLoginAt?: number;
  lastActivityAt?: number;
  createdAt: number;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/api/master/users');
      return data.data as SaasUser[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newUser: { fullName: string, email: string, password: string, role: string, permissions: string[] }) => {
      const { data } = await api.post('/api/master/users', {
        ...newUser,
        permissions: JSON.stringify(newUser.permissions)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Omit<Partial<SaasUser>, 'permissions'> & { permissions?: string[] } }) => {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.permissions) {
        payload.permissions = JSON.stringify(updates.permissions);
      }
      const { data } = await api.patch(`/api/master/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// FIX #3: Removed dead useUpdateUserStatus hook.
// The endpoint PATCH /users/:id/status does NOT exist in master.ts API.
// Status updates go through the generic useUpdateUser: mutate({ id, updates: { status } })

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/master/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
