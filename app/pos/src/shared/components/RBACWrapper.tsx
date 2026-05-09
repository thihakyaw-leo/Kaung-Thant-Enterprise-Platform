import React from 'react';
import { useAuthStore } from '../../features/auth/authStore';

interface RBACWrapperProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RBACWrapper: Hides/Shows children based on user permissions from auth store.
 */
export const RBACWrapper: React.FC<RBACWrapperProps> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuthStore();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
