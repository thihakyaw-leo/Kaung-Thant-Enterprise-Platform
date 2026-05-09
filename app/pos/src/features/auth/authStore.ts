import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface AuthState {
  user: UserProfile | null;
  permissions: string[];
  setAuth: (user: UserProfile, permissions: string[]) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      setAuth: (user: UserProfile, permissions: string[]) => set({ user, permissions }),
      logout: () => set({ user: null, permissions: [] }),
      hasPermission: (permission: string) => {
        const state = get();
        return state.permissions.includes(permission) || state.permissions.includes('admin.all');
      }
    }),
    { name: 'kt-auth-storage' }
  )
);
