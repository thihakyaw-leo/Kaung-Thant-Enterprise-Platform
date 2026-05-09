import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { Env } from '../../index';
import { sendTelegramNotification } from '../../shared/utils/telegram';

interface OrderEvent {
  orderId: string;
  amount: number;
  customerName: string;
}

export class OrderProcessingWorkflow extends WorkflowEntrypoint<Env, OrderEvent> {
  async run(event: WorkflowEvent<OrderEvent>, step: WorkflowStep) {
    const { orderId, amount, customerName } = event.payload;

    // Step 1: Validate Order & Check Inventory
    await step.do('validate-order', async () => {
      console.log(`Validating order ${orderId}...`);
      // Simulating DB check
      const result = await this.env.DB.prepare('SELECT id FROM inventory LIMIT 1').first();
      if (!result) throw new Error('Inventory check failed');
      return { status: 'validated' };
    });

    // Step 2: Process Payment (Simulated)
    await step.do('process-payment', async () => {
      console.log(`Processing payment of ${amount} for order ${orderId}...`);
      // In a real app, you'd call Stripe/etc.
      return { transactionId: `TXN_${crypto.randomUUID().replace(/-/g, '').slice(0, 9)}` };
    });

    // Step 3: Update Inventory
    await step.do('update-inventory', async () => {
      console.log(`Updating inventory for order ${orderId}...`);
      // Update DB
      await this.env.DB.prepare('UPDATE inventory SET stock = stock - 1 WHERE id = (SELECT id FROM inventory LIMIT 1)').run();
    });

    // Step 4: Send Notification
    await step.do('send-notification', async () => {
      const message = `<b>✅ New Order Processed</b>\n` +
        `🆔 Order ID: ${orderId}\n` +
        `👤 Customer: ${customerName}\n` +
        `💰 Amount: ${amount} MMK`;

      await sendTelegramNotification(
        this.env.TELEGRAM_BOT_TOKEN,
        this.env.TELEGRAM_CHAT_ID,
        message
      );
    });

    return { success: true, orderId };
  }
}
