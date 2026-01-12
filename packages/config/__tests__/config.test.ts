import ConfigManager from '../src/index';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  test('should create config manager instance', () => {
    expect(configManager).toBeDefined();
  });

  test('should return config object', () => {
    const config = configManager.getConfig();
    expect(config).toBeDefined();
    expect(config.database).toBeDefined();
  });

  test('should return full config', () => {
    const config = configManager.getFullConfig();
    expect(config.database.username).toBe('admin');
  });

  test('should generate database URL', () => {
    const dbUrl = configManager.getDatabaseUrl();
    expect(dbUrl).toContain('postgresql://');
    expect(dbUrl).toContain('admin');
  });

  test('should load dynamic config', () => {
    const dynamicConfig = '{ "newKey": "newValue" }';
    configManager.loadDynamicConfig(dynamicConfig);
    const config = configManager.getConfig();
    expect(config.newKey).toBe('newValue');
  });

  test('should load env config', () => {
    const envContent = 'TEST_VAR=test_value';
    configManager.loadEnvConfig(envContent);
    const config = configManager.getConfig();
    expect(config.TEST_VAR).toBe('test_value');
  });
});
