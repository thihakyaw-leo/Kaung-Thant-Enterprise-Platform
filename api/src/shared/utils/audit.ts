export interface AuditLog {
  userId?: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export async function queueAuditLog(queue: Queue, log: Omit<AuditLog, 'timestamp'>) {
  const fullLog: AuditLog = {
    ...log,
    timestamp: new Date().toISOString(),
  };

  try {
    await queue.send(fullLog);
  } catch (error) {
    console.error('[AuditQueue] Failed to send log:', error);
    // Optional: Fallback to direct D1 write if queue fails
  }
}
