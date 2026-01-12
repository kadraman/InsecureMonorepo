import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Logger from '@packages/logging';
import ConfigManager from '@packages/config';
import AuthService from '@packages/auth';
import sqlite3 from 'sqlite3';
import path from 'path';
import { exec } from 'child_process';

const app = express();
const logger = new Logger('users-service');
const configManager = new ConfigManager();
const authService = new AuthService();

// Vulnerability: CORS misconfiguration - allowing all origins
app.use(cors({ origin: '*', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create users table
db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT,
      password TEXT,
      role TEXT
    )
  `);

  // Insert default admin user with weak password
  db.run(
    "INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@example.com', 'admin123', 'admin')"
  );
});

// Vulnerability: SQL Injection
app.get('/api/users/search', (req: Request, res: Response) => {
  const { username } = req.query;
  
  // Vulnerability: Direct string concatenation in SQL query
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  
  logger.info(`Searching for user: ${username}`);
  
  db.all(query, (err, rows) => {
    if (err) {
      logger.error(`Database error: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Vulnerability: Mass assignment
app.post('/api/users', async (req: Request, res: Response) => {
  // Vulnerability: Accepting all fields from request body without validation
  const { username, email, password, role } = req.body;
  
  const hashedPassword = await authService.hashPassword(password);
  
  const query = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [username, email, hashedPassword, role || 'user'], function(err) {
    if (err) {
      logger.error(`Failed to create user: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    
    logger.logUserActivity(username, 'user_created', { id: this.lastID });
    res.status(201).json({ id: this.lastID, username, email, role });
  });
});

// Vulnerability: Authentication bypass
app.post('/api/users/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // Vulnerability: SQL Injection in login
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, (err, user: any) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Vulnerability: Using weak JWT
    const token = authService.generateToken(user);
    
    logger.info(`User logged in: ${username}`);
    res.json({ token, user });
  });
});

// Vulnerability: IDOR (Insecure Direct Object Reference)
app.get('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Vulnerability: No authorization check
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Vulnerability: Returning sensitive data including password hash
    res.json(user);
  });
});

// Vulnerability: Privilege escalation
app.put('/api/users/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  
  // Vulnerability: No authorization check - any user can change roles
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Role updated successfully' });
  });
});

// Vulnerability: Command injection
app.post('/api/users/export', (req: Request, res: Response) => {
  const { format } = req.body;
  
  // Vulnerability: Command injection through user input
  const command = `sqlite3 database.db ".mode ${format}" ".output users.${format}" "SELECT * FROM users"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error(`Export failed: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Export completed', output: stdout });
  });
});

// Vulnerability: Information disclosure
app.get('/api/debug/config', (req: Request, res: Response) => {
  // Vulnerability: Exposing full configuration including secrets
  res.json(configManager.getFullConfig());
});

// Vulnerability: Server-Side Request Forgery (SSRF)
app.post('/api/users/avatar', (req: Request, res: Response) => {
  const { url } = req.body;
  
  // Vulnerability: Fetching arbitrary URLs without validation
  const https = require('https');
  https.get(url, (response: any) => {
    let data = '';
    response.on('data', (chunk: any) => data += chunk);
    response.on('end', () => {
      res.json({ avatar: data });
    });
  }).on('error', (err: Error) => {
    res.status(500).json({ error: err.message });
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Users service running on port ${PORT}`);
  console.log(`Users service running on http://localhost:${PORT}`);
});

export default app;
