import Logger from '../src/index';
import fs from 'fs';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test-service');
  });

  afterEach(() => {
    // Clean up log files
    if (fs.existsSync('app.log')) {
      fs.unlinkSync('app.log');
    }
  });

  test('should create logger instance', () => {
    expect(logger).toBeDefined();
  });

  test('should log info message', () => {
    logger.info('Test info message');
    expect(fs.existsSync('app.log')).toBe(true);
  });

  test('should log error message', () => {
    logger.error('Test error message');
    expect(fs.existsSync('app.log')).toBe(true);
  });

  test('should log warn message', () => {
    logger.warn('Test warning message');
    expect(fs.existsSync('app.log')).toBe(true);
  });

  test('should log user activity', () => {
    logger.logUserActivity('testuser', 'login', { ip: '192.168.1.1' });
    expect(fs.existsSync('app.log')).toBe(true);
  });
});
