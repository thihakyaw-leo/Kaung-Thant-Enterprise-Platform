import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lt } from 'drizzle-orm';
import * as schema from '../../db/master.schema';

export class BillingService {
  constructor(private db: any) { }

  async processRecurringBilling() {
    const now = Math.floor(Date.now() / 1000);

    // 1. Fetch active subscriptions that have passed their end date
    const activeSubs = await this.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.status, 'active'),
          lt(schema.subscriptions.endDate, now)
        )
      )
      .all();

    for (const sub of activeSubs) {
      // 2. Get Plan details
      const plan = await this.db
        .select()
        .from(schema.pricingPlans)
        .where(eq(schema.pricingPlans.id, sub.planId))
        .get();

      if (!plan) continue;

      // 3. Generate Human-Readable Invoice ID
      const settings = await this.db.select().from(schema.systemSettings).all();
      const getSetting = (key: string, def: string) => settings.find((s: any) => s.key === key)?.value || def;
      
      const prefix = getSetting('billing_invoice_prefix', 'INV-{YYYY}-');
      const nextSeq = parseInt(getSetting('billing_next_sequence', '1'));
      const padding = parseInt(getSetting('billing_sequence_padding', '5'));
      
      const formattedPrefix = prefix
        .replace('{YYYY}', new Date().getFullYear().toString())
        .replace('{MM}', (new Date().getMonth() + 1).toString().padStart(2, '0'))
        .replace('{DD}', new Date().getDate().toString().padStart(2, '0'));
      
      const invoiceId = `${formattedPrefix}${nextSeq.toString().padStart(padding, '0')}`;

      await this.db.insert(schema.invoices).values({
        id: invoiceId,
        tenantId: sub.tenantId,
        subscriptionId: sub.id,
        amount: plan.price,
        status: 'unpaid',
        issuedDate: now,
        dueDate: now + (7 * 24 * 60 * 60), // 7 days to pay
      });

      // Update next sequence
      await this.db.update(schema.systemSettings)
        .set({ value: (nextSeq + 1).toString(), updatedAt: now })
        .where(eq(schema.systemSettings.key, 'billing_next_sequence'));

      // 4. Extend subscription end date if auto-renew is enabled
      if (sub.autoRenew) {
        const nextEndDate = sub.endDate + (30 * 24 * 60 * 60); // Add 30 days
        await this.db
          .update(schema.subscriptions)
          .set({ endDate: nextEndDate })
          .where(eq(schema.subscriptions.id, sub.id));
      }
    }

    return { processed: activeSubs.length };
  }
}
