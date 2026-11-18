type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatTimestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`\x1b[32m[INFO]\x1b[0m [${formatTimestamp()}] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m [${formatTimestamp()}] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m [${formatTimestamp()}] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`\x1b[36m[DEBUG]\x1b[0m [${formatTimestamp()}] ${message}`, ...args);
    }
  },
};
