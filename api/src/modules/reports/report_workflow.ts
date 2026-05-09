import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { Env } from '../../index';

interface ReportParams {
  month: string;
  year: number;
  locationId: string;
}

interface SalesSummary {
  totalOrders: number;
  revenue: number;
  tax: number;
}

/**
 * Cloudflare Workflow for Monthly POS Reports
 */
export class MonthlyReportWorkflow extends WorkflowEntrypoint<Env, ReportParams> {
  async run(event: WorkflowEvent<ReportParams>, step: WorkflowStep) {
    const { month, year, locationId } = event.payload;

    // Step 1: Query Sales Data from D1
    const reportData = await step.do('fetch-sales-data', async (): Promise<SalesSummary> => {
      const results = await this.env.DB.prepare(`
        SELECT 
          COUNT(*) as totalOrders,
          SUM(total_amount) as revenue,
          SUM(tax_amount) as tax
        FROM tx_sale_sale
        WHERE strftime('%m', datetime(transaction_date, 'unixepoch')) = ?
        AND strftime('%Y', datetime(transaction_date, 'unixepoch')) = ?
      `).bind(month.padStart(2, '0'), year.toString()).first<SalesSummary>();

      return results || { totalOrders: 0, revenue: 0, tax: 0 };
    });

    // Step 2: Aggregate & Format Report (CSV)
    const csvContent = await step.do('format-report', async () => {
      const headers = 'Month,Year,Total Orders,Total Revenue,Total Tax\n';
      const row = `${month},${year},${reportData.totalOrders},${reportData.revenue},${reportData.tax}`;
      return headers + row;
    });

    // Step 3: Archive to R2
    const r2Path = await step.do('upload-to-r2', async () => {
      const fileName = `exports/reports/${year}/${month}/monthly-sales-${locationId}.csv`;
      await this.env.R2_ARCHIVE.put(fileName, csvContent, {
        httpMetadata: { contentType: 'text/csv' }
      });
      return fileName;
    });

    // Step 4: Finalize and Notify (Simulated)
    await step.do('notify-admin', async () => {
      console.log(`Report generated successfully: ${r2Path}`);
    });
  }
}
