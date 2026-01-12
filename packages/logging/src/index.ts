import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Vulnerability: Log injection - user input not sanitized
export class Logger {
  private logger: winston.Logger;

  constructor(serviceName: string) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
          // Vulnerability: Log injection - directly including unsanitized input
          return `${info.timestamp} [${serviceName}] ${info.level}: ${info.message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
      ]
    });
  }

  // Vulnerability: Log injection
  log(level: string, message: string, meta?: any) {
    // No sanitization of user input before logging
    this.logger.log(level, message, meta);
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  // Vulnerability: Command injection through log rotation
  async rotateLog(logPath: string) {
    // Vulnerability: Command injection - user-provided path used directly in shell command
    return new Promise((resolve, reject) => {
      const command = `gzip ${logPath}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }

  // Vulnerability: Path traversal in log reading
  async readLog(filename: string): Promise<string> {
    // Vulnerability: No validation of filename, allowing path traversal
    const logPath = path.join('/var/log', filename);
    return fs.promises.readFile(logPath, 'utf-8');
  }

  // Vulnerability: Sensitive data logging
  logUserActivity(username: string, action: string, data: any) {
    // Vulnerability: Logging sensitive data without redaction
    this.info(`User ${username} performed ${action}`, {
      username,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

export default Logger;
