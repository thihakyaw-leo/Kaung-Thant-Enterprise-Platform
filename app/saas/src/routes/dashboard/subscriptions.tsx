import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionsPage } from '../../features/billing/SubscriptionsPage';

export const Route = createFileRoute('/dashboard/subscriptions')({
  component: SubscriptionsPage,
});
