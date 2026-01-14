import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Logger from '@packages/logging';
import ConfigManager from '@packages/config';
import AuthService from '@packages/auth';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const app = express();
const logger = new Logger('api-gateway');
const configManager = new ConfigManager();
const authService = new AuthService();

// Ensure upload directory exists to avoid ENOENT during tests
const UPLOAD_DIR = '/tmp/uploads';
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info(`Ensured upload dir: ${UPLOAD_DIR}`);
} catch (err: any) {
  logger.error(`Failed to create upload dir: ${err.message}`);
}

// Vulnerability: Weak rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Vulnerability: Too high limit
  message: 'Too many requests'
});

// Vulnerability: CORS misconfiguration
app.use(cors({
  origin: '*', // Vulnerability: Allowing all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter);

// Service URLs (hardcoded - vulnerability)
const SERVICES = {
  users: 'http://localhost:3001',
  products: 'http://localhost:3002',
  orders: 'http://localhost:3003'
};

// Vulnerability: Weak authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Vulnerability: Using unsafe token decoding
  const decoded = authService.decodeTokenUnsafe(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Vulnerability: Not verifying token signature
  (req as any).user = decoded.payload;
  next();
};

// Vulnerability: No input validation
const proxyRequest = async (serviceUrl: string, path: string, method: string, data?: any, headers?: any) => {
  try {
    const response = await axios({
      method: method as any,
      url: `${serviceUrl}${path}`,
      data,
      headers,
      // Vulnerability: Not validating SSL certificates
      httpsAgent: { rejectUnauthorized: false } as any
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vulnerability: Exposing internal service URLs
app.get('/api/services', (req: Request, res: Response) => {
  res.json(SERVICES);
});

// User service routes
app.all('/api/users/*', async (req: Request, res: Response) => {
  const path = req.path.replace('/api/users', '/api/users');
  
  try {
    const response = await proxyRequest(
      SERVICES.users,
      path,
      req.method,
      req.body,
      req.headers
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error(`User service error: ${error.message}`);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Products service routes
app.all('/api/products/*', async (req: Request, res: Response) => {
  const path = req.path.replace('/api/products', '/api/products');
  
  try {
    const response = await proxyRequest(
      SERVICES.products,
      path,
      req.method,
      req.body,
      req.headers
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error(`Products service error: ${error.message}`);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Orders service routes
app.all('/api/orders/*', async (req: Request, res: Response) => {
  const path = req.path.replace('/api/orders', '/api/orders');
  
  try {
    const response = await proxyRequest(
      SERVICES.orders,
      path,
      req.method,
      req.body,
      req.headers
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error(`Orders service error: ${error.message}`);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// Vulnerability: Open redirect
app.get('/api/redirect', (req: Request, res: Response) => {
  const { url } = req.query;
  // Vulnerability: Redirecting to user-supplied URL without validation
  res.redirect(url as string);
});

// Vulnerability: SSRF through proxy
app.post('/api/proxy', async (req: Request, res: Response) => {
  const { url, method, data } = req.body;
  
  try {
    // Vulnerability: Making requests to arbitrary URLs
    const response = await axios({
      method: (method || 'GET') as any,
      url,
      data
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vulnerability: GraphQL introspection enabled
app.post('/api/graphql', (req: Request, res: Response) => {
  const { query } = req.body;
  
  // Vulnerability: No query complexity limiting
  // Vulnerability: Introspection enabled
  res.json({ message: 'GraphQL endpoint - introspection enabled' });
});

// Vulnerability: Debug endpoint exposing sensitive info
app.get('/api/debug', (req: Request, res: Response) => {
  // Vulnerability: Exposing environment variables and config
  res.json({
    env: process.env,
    config: configManager.getFullConfig(),
    services: SERVICES,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Vulnerability: File upload without validation
app.post('/api/upload', (req: Request, res: Response) => {
  const { filename, content } = req.body;
  
  // Ensure upload directory exists at write time (defensive)
  try {
    const safeUploadDir = UPLOAD_DIR;
    fs.mkdirSync(safeUploadDir, { recursive: true });

    // Vulnerability: No file type validation
    // Vulnerability: Path traversal possible
    const uploadPath = path.join(safeUploadDir, filename);

    fs.writeFileSync(uploadPath, content);
    res.json({ message: 'File uploaded', path: uploadPath });
  } catch (err: any) {
    logger.error(`Upload error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Vulnerability: Exposing stack traces in production
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    error: err.message,
    stack: err.stack // Vulnerability: Exposing stack trace
  });
});

const PORT = process.env.PORT || 3000;

// Start server only when run directly to avoid leaving handles during tests
// Also avoid starting when running under Jest (NODE_ENV=test)
if (require.main === module && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    console.log(`API Gateway running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default app;
