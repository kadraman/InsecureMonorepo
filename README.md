# InsecureMonorepo

An intentionally vulnerable Node.js + TypeScript microservices monorepo for application security testing and demonstrations 
with tools such as OpenText Application Security, GitHub Advanced Security, and other security scanning tools.

⚠️ **WARNING**: This repository contains intentional security vulnerabilities. DO NOT use this code in production or expose it to the internet.

## Overview

This monorepo contains multiple microservices and shared packages with deliberate security vulnerabilities for security testing and training purposes.

### Architecture

```
insecuremonorepo/
├── packages/              # Shared packages
│   ├── logging/          # Logging utilities (with vulnerabilities)
│   ├── config/           # Configuration management (with vulnerabilities)
│   └── auth/             # Authentication utilities (with vulnerabilities)
└── services/             # Microservices
    ├── users-service/    # User management service
    ├── products-service/ # Product catalog service
    ├── orders-service/   # Order processing service
    └── api-gateway/      # API Gateway
```

## Deliberate Security Vulnerabilities

This monorepo includes the following types of security vulnerabilities:

### 1. Injection Vulnerabilities
- **SQL Injection**: Direct string concatenation in SQL queries
- **Command Injection**: Unsanitized user input in shell commands
- **Log Injection**: Unsanitized user input in log messages
- **XXE (XML External Entity)**: Unsafe XML parsing

### 2. Authentication & Authorization
- **Weak JWT Implementation**: Hardcoded secrets, 'none' algorithm support
- **Weak Password Hashing**: Low bcrypt rounds
- **Missing Authorization Checks**: IDOR vulnerabilities
- **Privilege Escalation**: Users can modify their own roles
- **Authentication Bypass**: SQL injection in login endpoints

### 3. Sensitive Data Exposure
- **Hardcoded Credentials**: Passwords and API keys in source code
- **Sensitive Data in Logs**: Credit card numbers, passwords logged
- **Information Disclosure**: Debug endpoints exposing config
- **Plaintext Storage**: Credit card data stored unencrypted

### 4. Security Misconfiguration
- **CORS Misconfiguration**: Allowing all origins
- **Weak Rate Limiting**: Very high limits
- **Missing Security Headers**: No helmet.js or security headers
- **Stack Trace Exposure**: Full error details exposed
- **Running as Root**: Docker containers running as root user

### 5. Vulnerable Dependencies
- **Outdated axios**: Known vulnerabilities (0.21.1)
- **Old js-yaml**: Deserialization vulnerabilities (3.13.1)
- **Old jsonwebtoken**: Various security issues

### 6. Business Logic Flaws
- **Race Conditions**: No transaction handling in order processing
- **Negative Quantities**: No validation on order quantities
- **Mass Assignment**: Accepting all request fields without validation

### 7. Other Vulnerabilities
- **SSRF**: Server-Side Request Forgery in multiple endpoints
- **Path Traversal**: No path validation in file operations
- **Open Redirect**: Unvalidated redirects
- **ReDoS**: Regular Expression Denial of Service
- **Insecure Deserialization**: JSON.parse on untrusted data

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kadraman/InsecureMonorepo.git
cd InsecureMonorepo
```

2. Install dependencies:
```bash
npm install
```

3. Build all packages and services:
```bash
npm run build
```

### Running Services

#### Run all services locally:

1. Build packages first:
```bash
cd packages/logging && npm install && npm run build
cd ../config && npm install && npm run build
cd ../auth && npm install && npm run build
```

2. Start each service in separate terminals:
```bash
# Terminal 1 - Users Service
cd services/users-service && npm install && npm run dev

# Terminal 2 - Products Service
cd services/products-service && npm install && npm run dev

# Terminal 3 - Orders Service
cd services/orders-service && npm install && npm run dev

# Terminal 4 - API Gateway
cd services/api-gateway && npm install && npm run dev
```

#### Using Docker Compose:

```bash
docker-compose up
```

### Service Endpoints

- **API Gateway**: http://localhost:3000
- **Users Service**: http://localhost:3001
- **Products Service**: http://localhost:3002
- **Orders Service**: http://localhost:3003

## API Examples

### Users Service

```bash
# Create user (with mass assignment vulnerability)
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","role":"admin"}'

# SQL Injection example
curl "http://localhost:3001/api/users/search?username=admin'%20OR%20'1'='1"

# Login (SQL injection vulnerable)
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Products Service

```bash
# Get all products
curl http://localhost:3002/api/products

# SQL Injection in search
curl "http://localhost:3002/api/products/search?query=Laptop'%20OR%20'1'='1"

# Path traversal vulnerability
curl "http://localhost:3002/api/products/image/../../etc/passwd"
```

### Orders Service

```bash
# Create order
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":1,"quantity":2}'

# IDOR vulnerability - access any order
curl http://localhost:3003/api/orders/1

# Store payment info (plaintext)
curl -X POST http://localhost:3003/api/orders/1/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"cardNumber":"4111111111111111","cvv":"123","expiryDate":"12/25"}'
```

## Testing

Run tests for all services:
```bash
npm test
```

Run tests for specific service:
```bash
cd services/users-service && npm test
```

## Security Testing

### Using GitHub Advanced Security

1. Enable Code Scanning in repository settings
2. Enable Secret Scanning
3. Enable Dependency Review
4. Push code and review security alerts

### Using Fortify/OpenText

```bash
# Install Fortify SCA
# Run analysis
sourceanalyzer -b monorepo-build -clean
sourceanalyzer -b monorepo-build **/*.ts
sourceanalyzer -b monorepo-build -scan -f results.fpr
```

### Manual Security Testing

Test for specific vulnerabilities:

1. **SQL Injection**:
   - Test with: `' OR '1'='1`
   - Test with: `'; DROP TABLE users--`

2. **Command Injection**:
   - Test export with: `csv; ls -la`

3. **JWT Vulnerabilities**:
   - Test with 'none' algorithm
   - Test with weak secret

4. **SSRF**:
   - Test with internal URLs: `http://localhost:3001`
   - Test with metadata endpoints: `http://169.254.169.254`

## Educational Purpose

This repository is designed for:
- Security training and education
- Testing security scanning tools
- Demonstrating OWASP Top 10 vulnerabilities
- CI/CD security pipeline demonstrations
- DevSecOps workshops

## License

MIT License - See LICENSE file

## Disclaimer

⚠️ **This code is intentionally vulnerable and should NEVER be used in production environments or exposed to the internet. It is for educational and testing purposes only.**
