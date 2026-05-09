import { createFileRoute } from '@tanstack/react-router';
import { HealthPage } from '../../features/dashboard/HealthPage';

export const Route = createFileRoute('/dashboard/health')({
  component: HealthPage,
});
