import loglevel from "loglevel";

interface LogLevel {
  TRACE: 0;
  DEBUG: 1;
  INFO: 2;
  WARN: 3;
  ERROR: 4;
  SILENT: 5;
}

const VALID_LOG_LEVELS = new Set<loglevel.LogLevelDesc>([
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "silent",
]);

const normalizeLogLevel = (rawLevel?: string): loglevel.LogLevelDesc | null => {
  if (!rawLevel) {
    return null;
  }

  // Support `.env` values with accidental inline comments.
  const candidate = rawLevel.split("#")[0]?.trim().toLowerCase();
  if (!candidate) {
    return null;
  }

  return VALID_LOG_LEVELS.has(candidate as loglevel.LogLevelDesc)
    ? (candidate as loglevel.LogLevelDesc)
    : null;
};

// Configure loglevel based on environment
const configureLogger = () => {
  // Set log level based on explicit env first, then fall back to MODE
  const env = import.meta.env.MODE || "development";
  const explicitLogLevelRaw =
    import.meta.env.VITE_LOGLEVEL || import.meta.env.VITE_LOG_LEVEL;
  const explicitLogLevel = normalizeLogLevel(explicitLogLevelRaw);
  let logLevelSource = "VITE_LOGLEVEL";

  if (explicitLogLevel) {
    // Use explicitly set log level
    loglevel.setLevel(explicitLogLevel);
    logLevelSource = import.meta.env.VITE_LOGLEVEL
      ? "VITE_LOGLEVEL"
      : "VITE_LOG_LEVEL";
  } else {
    if (explicitLogLevelRaw) {
      console.warn(
        `[Logger] Ignoring invalid log level "${explicitLogLevelRaw}". Falling back to MODE defaults.`
      );
    }
    // Fall back to MODE-based logic
    logLevelSource = "MODE fallback";
    switch (env) {
      case "production":
      case "test":
        loglevel.setLevel("warn"); // Only show warnings and errors in production/test
        break;
      case "development":
      default:
        loglevel.setLevel("debug"); // Show all logs in development
        break;
    }
  }

  // Log the environment and log level that was set
  const currentLevel = loglevel.getLevel();
  const levelName =
    (Object.keys(loglevel.levels) as Array<keyof typeof loglevel.levels>)
      .find((key) => loglevel.levels[key] === currentLevel)
      ?.toLowerCase() || "unknown";

  // Use console.log directly since logger might not be fully configured yet
  console.log(
    `[Logger] Initialized in ${env} environment with log level: ${levelName} (${logLevelSource})`
  );

  // Add timestamp and environment prefix to logs in development
  if (env === "development") {
    const originalFactory = loglevel.methodFactory;
    loglevel.methodFactory = (methodName, logLevel, loggerName) => {
      const rawMethod = originalFactory(methodName, logLevel, loggerName);
      return (...args) => {
        const timestamp = new Date().toISOString().split("T")[1].split(".")[0]; // HH:MM:SS
        rawMethod(`[${timestamp}]`, ...args);
      };
    };
    loglevel.setLevel(loglevel.getLevel()); // Apply the method factory
  }
};

// Initialize the logger
configureLogger();

// Export the configured logger instance
export const logger = loglevel;

// Export convenience functions for different log levels
export const log = {
  trace: (...args: unknown[]) => logger.trace(...args),
  debug: (...args: unknown[]) => logger.debug(...args),
  info: (...args: unknown[]) => logger.info(...args),
  warn: (...args: unknown[]) => logger.warn(...args),
  error: (...args: unknown[]) => logger.error(...args),

  // Create namespaced loggers for different parts of the app
  createLogger: (namespace: string) => {
    const namespacedLogger = loglevel.getLogger(namespace);
    namespacedLogger.setLevel(logger.getLevel());
    return {
      trace: (...args: unknown[]) =>
        namespacedLogger.trace(`[${namespace}]`, ...args),
      debug: (...args: unknown[]) =>
        namespacedLogger.debug(`[${namespace}]`, ...args),
      info: (...args: unknown[]) =>
        namespacedLogger.info(`[${namespace}]`, ...args),
      warn: (...args: unknown[]) =>
        namespacedLogger.warn(`[${namespace}]`, ...args),
      error: (...args: unknown[]) =>
        namespacedLogger.error(`[${namespace}]`, ...args),
    };
  },

  // Utility to temporarily change log level
  setLevel: (level: loglevel.LogLevelDesc) => {
    logger.setLevel(level);
  },

  // Get current log level
  getLevel: () => logger.getLevel(),

  // Disable all logging
  disable: () => logger.disableAll(),

  // Enable all logging
  enable: () => logger.enableAll(),
};

// Export types for TypeScript
export type { LogLevelDesc, LogLevelNumbers } from "loglevel";
export type { LogLevel };
