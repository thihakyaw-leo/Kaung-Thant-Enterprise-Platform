import { createFileRoute } from '@tanstack/react-router';
import { SecurityCompliancePage } from '../../features/dashboard/SecurityCompliancePage';

export const Route = createFileRoute('/dashboard/security')({
  component: SecurityCompliancePage,
});
