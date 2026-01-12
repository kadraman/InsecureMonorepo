import express, { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import Logger from '@packages/logging';
import ConfigManager from '@packages/config';
import AuthService from '@packages/auth';
import * as sqlite3 from 'sqlite3';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const logger = new Logger('products-service');
const configManager = new ConfigManager();
const authService = new AuthService();

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      stock INTEGER
    )
  `);

  // Insert sample products
  const products = [
    ['Laptop', 'High-performance laptop', 1299.99, 'Electronics', 50],
    ['Smartphone', 'Latest model smartphone', 799.99, 'Electronics', 100],
    ['Headphones', 'Wireless headphones', 199.99, 'Electronics', 200]
  ];

  products.forEach(product => {
    db.run('INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)', product);
  });
});

// Vulnerability: SQL Injection in search
app.get('/api/products/search', (req: Request, res: Response) => {
  const { query, category } = req.query;
  
  // Vulnerability: String concatenation in SQL
  let sqlQuery = 'SELECT * FROM products WHERE 1=1';
  
  if (query) {
    sqlQuery += ` AND name LIKE '%${query}%'`;
  }
  
  if (category) {
    sqlQuery += ` AND category = '${category}'`;
  }
  
  logger.info(`Searching products: ${sqlQuery}`);
  
  db.all(sqlQuery, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Vulnerability: XXE (XML External Entity) vulnerability
app.post('/api/products/import', async (req: Request, res: Response) => {
  const xmlData = req.body;
  
  // Vulnerability: Parsing XML without disabling external entities
  const parser = new xml2js.Parser({
    // Vulnerability: External entities enabled
    explicitRoot: false
  });
  
  try {
    const result = await parser.parseStringPromise(xmlData);
    logger.info('Imported products from XML');
    res.json({ message: 'Import successful', data: result });
  } catch (error: any) {
    logger.error(`XML import failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Vulnerability: Path traversal
app.get('/api/products/image/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  
  // Vulnerability: No path validation
  const imagePath = path.join('/var/www/images', filename);
  
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.send(data);
  });
});

// Vulnerability: NoSQL Injection (simulated)
app.get('/api/products/filter', (req: Request, res: Response) => {
  const { minPrice, maxPrice } = req.query;
  
  // Vulnerability: Using dynamic query building
  const query = `SELECT * FROM products WHERE price >= ${minPrice} AND price <= ${maxPrice}`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Vulnerability: Mass assignment
app.post('/api/products', (req: Request, res: Response) => {
  // Vulnerability: Accepting all fields without validation
  const { name, description, price, category, stock } = req.body;
  
  const query = 'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)';
  
  db.run(query, [name, description, price, category, stock], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    logger.info(`Product created: ${name}`);
    res.status(201).json({ id: this.lastID, name, description, price, category, stock });
  });
});

// Vulnerability: Insecure Direct Object Reference
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Vulnerability: No authorization check
  db.run('DELETE FROM products WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Product deleted' });
  });
});

// Vulnerability: Regular Expression Denial of Service (ReDoS)
app.get('/api/products/validate', (req: Request, res: Response) => {
  const { productName } = req.query;
  
  // Vulnerability: Catastrophic backtracking regex
  const regex = /^(a+)+$/;
  const isValid = regex.test(productName as string);
  
  res.json({ valid: isValid });
});

// Vulnerability: Unvalidated redirect
app.get('/api/products/:id/external', (req: Request, res: Response) => {
  const { url } = req.query;
  
  // Vulnerability: Redirecting to user-supplied URL
  res.redirect(url as string);
});

// Get all products
app.get('/api/products', (req: Request, res: Response) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get product by ID
app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(row);
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`Products service running on port ${PORT}`);
  console.log(`Products service running on http://localhost:${PORT}`);
});

export default app;
