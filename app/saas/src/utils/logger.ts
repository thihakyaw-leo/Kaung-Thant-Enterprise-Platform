type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogData {
    return {
      message,
      level,
      timestamp: new Date().toISOString(),
      context,
      error
    };
  }

  private printToConsole(data: LogData) {
    const { level, message, timestamp, context, error } = data;
    const color = level === 'error' ? 'red' : level === 'warn' ? 'orange' : 'cyan';
    
    console.log(
      `%c[${timestamp}] [${level.toUpperCase()}] %c${message}`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit; font-weight: normal;',
      context || '',
      error || ''
    );
  }

  public info(message: string, context?: Record<string, unknown>) {
    const data = this.formatLog('info', message, context);
    if (this.isDevelopment) {
      this.printToConsole(data);
    }
  }

  public warn(message: string, context?: Record<string, unknown>) {
    const data = this.formatLog('warn', message, context);
    if (this.isDevelopment) {
      this.printToConsole(data);
    }
  }

  public async error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const err = error instanceof Error ? error : new Error(String(error));
    const data = this.formatLog('error', message, context, err);
    
    if (this.isDevelopment) {
      this.printToConsole(data);
    } else {
      console.error(JSON.stringify(data));
      
      // Send to API for Telegram Notification
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        await fetch(`${baseUrl}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            error: {
              message: err.message,
              stack: err.stack,
            },
            context,
            level: 'error'
          }),
        });
      } catch (e) {
        console.error('Failed to send log to API:', e);
      }
    }
  }
}

export const logger = Logger.getInstance();
