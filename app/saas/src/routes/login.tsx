import { createFileRoute, redirect } from '@tanstack/react-router'
import Login from '../features/auth/Login'
import { useAuthStore } from '../features/auth/useAuthStore'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: () => <Login />,
})
