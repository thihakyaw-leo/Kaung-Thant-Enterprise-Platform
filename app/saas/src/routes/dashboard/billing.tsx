import { createFileRoute } from '@tanstack/react-router';
import { BillingManagement } from '../../features/billing/BillingManagement';

export const Route = createFileRoute('/dashboard/billing')({
  component: BillingManagement,
});
