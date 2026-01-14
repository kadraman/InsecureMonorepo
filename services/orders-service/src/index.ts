import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Logger from '@packages/logging';
import ConfigManager from '@packages/config';
import AuthService from '@packages/auth';
import sqlite3 from 'sqlite3';
import axios from 'axios';

const app = express();
const logger = new Logger('orders-service');
const configManager = new ConfigManager();
const authService = new AuthService();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      productId INTEGER,
      quantity INTEGER,
      totalPrice REAL,
      status TEXT,
      createdAt TEXT
    )
  `);

  db.run(`
    CREATE TABLE payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      amount REAL,
      cardNumber TEXT,
      cvv TEXT,
      expiryDate TEXT
    )
  `);
});

// Vulnerability: Insecure Direct Object Reference
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Vulnerability: No authorization check - any user can view any order
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });
});

// Vulnerability: SQL Injection
app.get('/api/orders/user/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.query;
  
  // Vulnerability: String concatenation in SQL
  let query = `SELECT * FROM orders WHERE userId = ${userId}`;
  
  if (status) {
    query += ` AND status = '${status}'`;
  }
  
  db.all(query, (err, orders) => {
    if (err) {
      logger.error(`Database error: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    res.json(orders);
  });
});

// Vulnerability: Race condition in order processing
app.post('/api/orders', async (req: Request, res: Response) => {
  const { userId, productId, quantity } = req.body;
  
  // Vulnerability: No transaction handling - race condition possible
  // Check stock (simulated)
  const checkStock = new Promise((resolve) => {
    setTimeout(() => resolve(true), 100);
  });
  
  await checkStock;
  
  // Calculate price (vulnerable to timing attacks)
  const totalPrice = quantity * 100; // Simplified pricing
  
  const query = 'INSERT INTO orders (userId, productId, quantity, totalPrice, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.run(query, [userId, productId, quantity, totalPrice, 'pending', new Date().toISOString()], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    logger.logUserActivity(userId, 'order_created', { orderId: this.lastID, amount: totalPrice });
    res.status(201).json({ id: this.lastID, userId, productId, quantity, totalPrice });
  });
});

// Vulnerability: Storing sensitive payment data
app.post('/api/orders/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, cardNumber, cvv, expiryDate } = req.body;
  
  // Vulnerability: Storing credit card details in plaintext
  const query = 'INSERT INTO payments (orderId, amount, cardNumber, cvv, expiryDate) VALUES (?, ?, ?, ?, ?)';
  
  db.run(query, [id, amount, cardNumber, cvv, expiryDate], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Vulnerability: Logging sensitive payment information
    logger.info(`Payment processed for order ${id}: Card ${cardNumber}, CVV ${cvv}`);
    
    res.json({ message: 'Payment processed', paymentId: this.lastID });
  });
});

// Vulnerability: SSRF (Server-Side Request Forgery)
app.post('/api/orders/:id/notify', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { webhookUrl } = req.body;
  
  try {
    // Vulnerability: Making requests to user-supplied URLs
    const response = await axios.post(webhookUrl, {
      orderId: id,
      status: 'completed'
    });
    
    res.json({ message: 'Notification sent', response: response.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vulnerability: Business logic flaw - negative quantities
app.put('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, status } = req.body;
  
  // Vulnerability: No validation for negative quantities
  let query = 'UPDATE orders SET ';
  const updates = [];
  const values = [];
  
  if (quantity !== undefined) {
    updates.push('quantity = ?');
    values.push(quantity);
  }
  
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  
  query += updates.join(', ') + ' WHERE id = ?';
  values.push(id);
  
  db.run(query, values, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Order updated' });
  });
});

// Vulnerability: Information disclosure
app.get('/api/orders/:id/payment', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Vulnerability: Returning full payment details including card info
  db.get('SELECT * FROM payments WHERE orderId = ?', [id], (err, payment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    // Vulnerability: Exposing sensitive payment data
    res.json(payment);
  });
});

// Get all orders (for admin - but no auth check)
app.get('/api/orders', (req: Request, res: Response) => {
  // Vulnerability: No authorization check
  db.all('SELECT * FROM orders', (err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(orders);
  });
});

// Vulnerability: Insecure deserialization
app.post('/api/orders/import', (req: Request, res: Response) => {
  const { data } = req.body;
  
  try {
    // Vulnerability: Deserializing untrusted data
    const orders = JSON.parse(data);
    
    // Process orders without validation
    res.json({ message: 'Orders imported', count: orders.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  logger.info(`Orders service running on port ${PORT}`);
  console.log(`Orders service running on http://localhost:${PORT}`);
});

export default app;
