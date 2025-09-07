import { v4 as uuidv4 } from "uuid";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

const formatLog = (entry: LogEntry) => {
  return JSON.stringify(entry);
};

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(
      formatLog({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: "INFO",
        message,
        context,
      })
    );
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(
      formatLog({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: "WARN",
        message,
        context,
      })
    );
  },
  error: (message: string, context?: Record<string, any>) => {
    console.error(
      formatLog({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: "ERROR",
        message,
        context,
      })
    );
  },
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.DEBUG === "true") {
      console.debug(
        formatLog({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          level: "DEBUG",
          message,
          context,
        })
      );
    }
  },
};
