import Logger from '../src/index';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test-service');
  });

  test('should create logger instance', () => {
    expect(logger).toBeDefined();
  });

  test('should log info message without errors', () => {
    expect(() => logger.info('Test info message')).not.toThrow();
  });

  test('should log error message without errors', () => {
    expect(() => logger.error('Test error message')).not.toThrow();
  });

  test('should log warn message without errors', () => {
    expect(() => logger.warn('Test warning message')).not.toThrow();
  });

  test('should log user activity without errors', () => {
    expect(() => logger.logUserActivity('testuser', 'login', { ip: '192.168.1.1' })).not.toThrow();
  });
});
