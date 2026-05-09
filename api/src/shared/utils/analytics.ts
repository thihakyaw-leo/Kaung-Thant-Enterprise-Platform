import { Env } from '../../index';

export interface TransactionMetric {
  type: 'SALE' | 'RETURN' | 'VOID';
  amount: number;
  paymentMethod: string;
  locationId: string;
  userId: string;
}

/**
 * Cloudflare Analytics Engine Utility
 * Captures real-time transaction data for edge monitoring
 */
export async function trackTransaction(env: Env, metric: TransactionMetric) {
  if (!env.API_METRICS) return;

  try {
    env.API_METRICS.writeDataPoint({
      blobs: [
        metric.type,
        metric.paymentMethod,
        metric.locationId,
        metric.userId
      ],
      doubles: [
        metric.amount,
        Date.now()
      ],
      indexes: [metric.locationId] // Index by location for fast filtering
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
}
