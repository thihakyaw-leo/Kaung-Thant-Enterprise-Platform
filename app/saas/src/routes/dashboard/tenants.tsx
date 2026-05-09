// Triggering route regeneration
import { createFileRoute } from '@tanstack/react-router'
import { TenantsManagement } from '../../features/tenants/TenantsManagement'

export const Route = createFileRoute('/dashboard/tenants')({
  component: TenantsManagement,
})
