import React from 'react';
import { useAuthStore } from '../../features/auth/authStore';
import type { AuthState } from '../../features/auth/authStore';

interface HasPermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * HAS PERMISSION COMPONENT
 * Conditionally renders children based on user permissions
 */
export const HasPermission: React.FC<HasPermissionProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const hasPermission = useAuthStore((state: AuthState) => state.hasPermission(permission));
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
