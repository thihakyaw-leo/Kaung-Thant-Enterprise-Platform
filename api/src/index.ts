import { Hono } from 'hono';

import authAPI from './modules/auth/auth';
import salesAPI from './modules/sales/sales';
import saleReturnAPI from './modules/sales/return';
import inventoryAPI from './modules/inventory/inventory';
import transferAPI from './modules/inventory/transfer';
import purchaseAPI from './modules/purchases/purchase';
import purchaseReturnAPI from './modules/purchases/return';
import contactsAPI from './modules/contacts/contacts';
import settingAPI from './modules/config/setting';
import reportsAPI from './modules/reports/reports';
import stockManagementAPI from './modules/inventory/stock_management';
import setupAPI from './modules/setup/setup';
import auditAPI from './modules/reports/audit';
import deliveryAPI from './modules/sales/delivery';
import masterAPI from './modules/master/master';
import healthAPI from './modules/setup/health';
import sessionAPI from './modules/setup/session.route';
import expenseAPI from './modules/expenses/expense';
import paymentAPI from './modules/payments/digital_payment';
import { sendTelegramNotification } from './shared/utils/telegram';

import tenantCrudApp from './modules/tenant/crud.route';
import masterCrudApp from './modules/master/crud.route';

import { authGuard } from './shared/middleware/auth';
import { structuredLogger } from './shared/middleware/logger';

// Define the exact Env structure requested by the user
import { AuditLog } from './shared/utils/audit';
import { OrderProcessingWorkflow } from './modules/sales/order_workflow';
import { MonthlyReportWorkflow } from './modules/reports/report_workflow';
import { SessionCoordinator } from './shared/objects/session';
import { LocationStockCoordinator } from './shared/objects/stock_coordinator';

export interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
    AUDIT_QUEUE: Queue;
    ORDER_WORKFLOW: Workflow;
    REPORT_WORKFLOW: Workflow;
    BROWSER: Fetcher;
    GOOGLE_GENERATIVE_AI_API_KEY: string;
    KV_CACHE: KVNamespace;
    POS_SETTINGS: KVNamespace;
    R2_ARCHIVE: R2Bucket;
    R2_MEDIA: R2Bucket;
    API_METRICS: AnalyticsEngineDataset;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_API_TOKEN: string;
    ENVIRONMENT: string;
    KBZ_APP_KEY: string;
    KBZ_MERCHANT_CODE: string;
    WAVE_MERCHANT_ID: string;
    SESSION_COORDINATOR: DurableObjectNamespace<SessionCoordinator>;
    STOCK_COORDINATOR: DurableObjectNamespace<LocationStockCoordinator>;
}

import { t } from './shared/utils/i18n';

type Variables = {
  userId: string;
  lang: 'en' | 'my';
};

export { 
  OrderProcessingWorkflow, 
  MonthlyReportWorkflow, 
  SessionCoordinator, 
  LocationStockCoordinator 
};

import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

// 1. Localization Middleware
app.use('*', async (c, next) => {
  const acceptLang = c.req.header('Accept-Language');
  c.set('lang', acceptLang?.includes('my') ? 'my' : 'en');
  await next();
});

const protectedAPI = new Hono<{ Bindings: Env, Variables: Variables }>();

// Global CORS Middleware
app.use('*', cors({
  origin: (origin) => origin ?? '*', // Dynamically allow the requesting origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

app.use('*', structuredLogger());

import { rateLimit } from './shared/middleware/ratelimit';
import { analyticsMiddleware } from './shared/middleware/analytics';

// Global Analytics Middleware
app.use('*', analyticsMiddleware);

// Global Rate Limiter: Max 100 requests per minute per IP for spam/DDoS protection
app.use('*', rateLimit(100, 60, 'global_api'));

// Public Routes
app.get('/', (c) => c.text('Kaung Thant Enterprise API is running!'));
app.get('/favicon.ico', (c) => c.text('Favicon', 200)); 

// Custom Public / Unprotected APIs
app.route('/api/auth', authAPI);
app.route('/api/health', healthAPI);

// Public Error Logging Endpoint
app.post('/api/logs', async (c) => {
  const body = await c.req.json();
  const { message, error, context, level } = body;
  
  const logMessage = `<b>[FRONTEND ${level?.toUpperCase() || 'ERROR'}]</b>\n` +
    `📅 ${new Date().toISOString()}\n` +
    `💬 ${message}\n` +
    `${error ? `❌ Error: ${JSON.stringify(error)}\n` : ''}` +
    `${context ? `📦 Context: ${JSON.stringify(context)}` : ''}`;

  if (level === 'error') {
    c.executionCtx.waitUntil(
      sendTelegramNotification(c.env.TELEGRAM_BOT_TOKEN, c.env.TELEGRAM_CHAT_ID, logMessage)
    );
  }

  console.error(`[Frontend Log] ${JSON.stringify(body)}`);
  return c.json({ success: true });
});

import { hasPermission } from './shared/middleware/permissions';

// Protected Routes
protectedAPI.use('*', authGuard);

// Apply Role-Based Permissions
protectedAPI.use('/config/*', hasPermission('config.*'));
protectedAPI.use('/reports/*', hasPermission('reports.*'));
protectedAPI.use('/stock-management/*', hasPermission('inventory.manage'));
protectedAPI.use('/setup/*', hasPermission('config.setup'));
protectedAPI.use('/audit/*', hasPermission('reports.audit'));
protectedAPI.use('/master/*', hasPermission('*'));
protectedAPI.use('/master-crud/*', hasPermission('*'));

// Custom Protected APIs
protectedAPI.route('/sales', salesAPI);
protectedAPI.route('/sales/returns', saleReturnAPI);
protectedAPI.route('/inventory', inventoryAPI);
protectedAPI.route('/inventory/transfers', transferAPI);
protectedAPI.route('/purchases', purchaseAPI);
protectedAPI.route('/purchase-returns', purchaseReturnAPI);
protectedAPI.route('/contacts', contactsAPI);
protectedAPI.route('/config', settingAPI);
protectedAPI.route('/reports', reportsAPI);
protectedAPI.route('/stock-management', stockManagementAPI);
protectedAPI.route('/setup', setupAPI);
protectedAPI.route('/sessions', sessionAPI);
protectedAPI.route('/audit', auditAPI);
protectedAPI.route('/expenses', expenseAPI);
protectedAPI.route('/payments', paymentAPI);
protectedAPI.route('/delivery', deliveryAPI);

// Tenant CRUD APIs
protectedAPI.route('/crud', tenantCrudApp);

// Master APIs (SaaS Admin level)
protectedAPI.route('/master', masterAPI);
protectedAPI.route('/master-crud', masterCrudApp);

app.route('/api', protectedAPI);

// Global Not Found Handler
app.notFound((c) => {
  return c.json({
    success: false,
    data: null,
    error: 'The requested resource was not found'
  }, 404);
});

// Global Error Handler
import { HTTPException } from 'hono/http-exception';

app.onError((err, c) => {
  const errorData = {
    message: err.message,
    stack: err.stack,
    method: c.req.method,
    url: c.req.url,
    timestamp: new Date().toISOString(),
    status: err instanceof HTTPException ? err.status : 500
  };

  // Structured logging for Cloudflare Observability
  console.error(JSON.stringify(errorData));
  
  // Telegram Alert for critical errors (500)
  if (errorData.status >= 500) {
    const telegramMessage = `<b>[BACKEND ERROR]</b>\n` +
      `📅 ${errorData.timestamp}\n` +
      `🔗 ${errorData.method} ${errorData.url}\n` +
      `❌ ${errorData.message}\n` +
      `<pre>${errorData.stack?.slice(0, 500)}...</pre>`;

    c.executionCtx.waitUntil(
      sendTelegramNotification(c.env.TELEGRAM_BOT_TOKEN, c.env.TELEGRAM_CHAT_ID, telegramMessage)
    );
  }
  
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      data: null,
      error: err.message
    }, err.status);
  }

  // Generic 500 for unhandled exceptions
  return c.json({
    success: false,
    data: null,
    error: 'Internal Server Error'
  }, 500);
});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<AuditLog>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const log = message.body;
      try {
        await env.DB.prepare(
          'INSERT INTO audit_logs (user_id, action, module, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          log.userId || 'system',
          log.action,
          log.module,
          log.details,
          log.ipAddress || '0.0.0.0',
          log.timestamp
        ).run();
        message.ack();
      } catch (error) {
        console.error('[QueueConsumer] Failed to process message:', error);
      }
    }
  },
  
  /**
   * Tail Event Handler
   * Captures console logs and filters for Audit events to save to R2
   */
  async tail(events: any[], env: Env, ctx: ExecutionContext) {
    const auditLogs = events
      .flatMap((e: any) => e.logs)
      .filter((log: any) => {
        try {
          const messageStr = typeof log.message[0] === 'string' ? log.message[0] : JSON.stringify(log.message[0]);
          const data = JSON.parse(messageStr);
          // Filter for specific audit-worthy paths or tags (e.g. Sales, Transfers)
          return data.path?.includes('/checkout') || data.path?.includes('/transfer');
        } catch {
          return false;
        }
      });

    if (auditLogs.length > 0) {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `audit-logs/${timestamp}/${crypto.randomUUID()}.json`;
      
      ctx.waitUntil(
        env.R2_ARCHIVE.put(fileName, JSON.stringify(auditLogs))
          .catch(err => console.error('Failed to save audit logs to R2:', err))
      );
    }
  }
};