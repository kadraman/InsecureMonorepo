import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

export interface Config {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  api: {
    port: number;
    baseUrl: string;
    secretKey: string;
  };
  services: {
    [key: string]: string;
  };
}

export class ConfigManager {
  private config: any = {};

  constructor() {
    // Vulnerability: Hardcoded credentials
    this.config = {
      database: {
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'P@ssw0rd123!', // Hardcoded password
        database: 'production_db'
      },
      api: {
        port: 3000,
        baseUrl: 'http://localhost:3000',
        secretKey: 'super-secret-key-12345' // Hardcoded secret key
      },
      aws: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE', // Hardcoded AWS credentials
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      }
    };
  }

  // Vulnerability: Insecure deserialization with js-yaml
  loadYamlConfig(filePath: string): any {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Vulnerability: Using unsafe yaml.load() instead of yaml.safeLoad()
    return yaml.load(content);
  }

  // Vulnerability: Path traversal
  loadConfigFile(filename: string): any {
    // Vulnerability: No validation, allows path traversal
    const configPath = path.join('/etc/config', filename);
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  }

  // Vulnerability: Environment variable injection
  loadEnvConfig(envContent: string): void {
    // Vulnerability: Parsing arbitrary environment content
    const parsed = dotenv.parse(envContent);
    Object.assign(this.config, parsed);
  }

  getConfig(): any {
    return this.config;
  }

  // Vulnerability: Exposing sensitive configuration
  getFullConfig(): Config {
    // Returning full config including passwords and secrets
    return this.config;
  }

  // Vulnerability: SQL connection string with embedded credentials
  getDatabaseUrl(): string {
    const { host, port, username, password, database } = this.config.database;
    // Vulnerability: Connection string with plaintext credentials
    return `postgresql://${username}:${password}@${host}:${port}/${database}`;
  }

  // Vulnerability: Dynamic config loading with eval
  loadDynamicConfig(configCode: string): void {
    // Vulnerability: Using eval with user-provided input
    try {
      const dynamicConfig = eval(`(${configCode})`);
      Object.assign(this.config, dynamicConfig);
    } catch (error) {
      console.error('Failed to load dynamic config:', error);
    }
  }

  // Vulnerability: Writing secrets to disk
  saveConfig(filepath: string): void {
    // Vulnerability: Writing sensitive config including passwords to file
    fs.writeFileSync(filepath, JSON.stringify(this.config, null, 2));
  }
}

export default ConfigManager;
