import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '../components/Layout/DashboardLayout'
import { useAuthStore } from '../features/auth/useAuthStore'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardLayout,
})
