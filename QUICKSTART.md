# Quick Start Guide

Get the Insecure-Monorepo running in 5 minutes.

⚠️ **WARNING: This code is intentionally vulnerable. Only run in isolated environments.**

## Option 1: Quick Test (Recommended)

### Prerequisites
- Node.js 18+
- npm 8+

### Steps

```bash
# 1. Clone and install
git clone https://github.com/kadraman/Insecure-Monorepo.git
cd Insecure-Monorepo
npm install

# 2. Build everything
npm run build

# 3. Start a single service (Users Service)
cd services/users-service
npm run dev
```

Visit http://localhost:3001/api/users/search?username=admin

### Test a Vulnerability

```bash
# SQL Injection example
curl "http://localhost:3001/api/users/search?username=admin'%20OR%20'1'='1"
```

## Option 2: Run All Services

### Terminal 1 - Users Service
```bash
cd services/users-service
npm run dev
```

### Terminal 2 - Products Service
```bash
cd services/products-service
npm run dev
```

### Terminal 3 - Orders Service
```bash
cd services/orders-service
npm run dev
```

### Terminal 4 - API Gateway
```bash
cd services/api-gateway
npm run dev
```

## Option 3: Docker Compose (Simplest)

### Prerequisites
- Docker
- Docker Compose

### Steps

```bash
# 1. Clone
git clone https://github.com/kadraman/Insecure-Monorepo.git
cd Insecure-Monorepo

# 2. Start all services
docker-compose up
```

All services will be available at:
- API Gateway: http://localhost:3000
- Users Service: http://localhost:3001
- Products Service: http://localhost:3002
- Orders Service: http://localhost:3003

## Quick Tests

### Test SQL Injection
```bash
# Normal request
curl "http://localhost:3001/api/users/search?username=admin"

# SQL Injection
curl "http://localhost:3001/api/users/search?username=admin'%20OR%20'1'='1"
```

### Test Authentication Bypass
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1'\''--","password":"anything"}'
```

### Test IDOR
```bash
# Access any user's data without authentication
curl http://localhost:3001/api/users/1
curl http://localhost:3001/api/users/2
```

### Test Information Disclosure
```bash
# View all secrets and configuration
curl http://localhost:3001/api/debug/config
curl http://localhost:3000/api/debug
```

### Test SSRF
```bash
# Make the server request internal services
curl -X POST http://localhost:3001/api/users/avatar \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:3001/api/debug/config"}'
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific package tests
cd packages/logging && npm test
cd packages/auth && npm test

# Run specific service tests
cd services/users-service && npm test
```

## Scanning for Vulnerabilities

### Using npm audit
```bash
npm audit
```

### Using Snyk (if installed)
```bash
snyk test
```

### Using GitHub Advanced Security
1. Enable Code Scanning in repository settings
2. Enable Secret Scanning
3. Enable Dependency Review
4. Push code and review alerts

## Troubleshooting

### Build Errors
```bash
# Clean and rebuild
npm run clean --workspaces
npm install
npm run build
```

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
lsof -ti:3002 | xargs kill
lsof -ti:3003 | xargs kill
```

### Docker Issues
```bash
# Clean up Docker
docker-compose down
docker-compose up --build
```

## Next Steps

1. **Explore vulnerabilities**: See [VULNERABILITY_CATALOG.md](VULNERABILITY_CATALOG.md)
2. **Try exploits**: See [EXAMPLES.md](EXAMPLES.md)
3. **Run security scans**: Use your favorite security tools
4. **Learn**: Study the vulnerable code patterns

## Important Reminders

- ⚠️ **Never deploy this code to production**
- ⚠️ **Never expose to the internet**
- ⚠️ **Only use in isolated test environments**
- ⚠️ **Do not use real credentials or data**

## Need Help?

- See [README.md](README.md) for detailed setup
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guide
- Open an issue on GitHub for questions

## Quick Links

- [Full Documentation](README.md)
- [Vulnerability Catalog](VULNERABILITY_CATALOG.md)
- [Testing Examples](EXAMPLES.md)
- [Security Policy](SECURITY.md)
- [Contributing Guide](CONTRIBUTING.md)
