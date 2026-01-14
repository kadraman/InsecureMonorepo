# Contributing to Insecure-Monorepo

This repository is designed for security testing and educational purposes. While it's not meant for production use, contributions are welcome to improve the demonstration of security vulnerabilities.

## Purpose

This repository demonstrates:
- Common security vulnerabilities in Node.js/TypeScript applications
- How security scanning tools detect these vulnerabilities
- Best practices for secure coding (by showing what NOT to do)

## Development Setup

### Prerequisites

- Node.js 18+
- npm 8+
- Git

### Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/kadraman/Insecure-Monorepo.git
cd Insecure-Monorepo
```

2. Install dependencies:
```bash
npm install
```

3. Build all packages and services:
```bash
npm run build
```

### Building Individual Components

Build all packages:
```bash
cd packages/logging && npm run build
cd ../config && npm run build
cd ../auth && npm run build
```

Build all services:
```bash
cd services/users-service && npm run build
cd ../products-service && npm run build
cd ../orders-service && npm run build
cd ../api-gateway && npm run build
```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests for a specific package or service:
```bash
cd packages/logging && npm test
cd services/users-service && npm test
```

### Running Services

Start services individually:
```bash
# Terminal 1 - Users Service
cd services/users-service && npm run dev

# Terminal 2 - Products Service
cd services/products-service && npm run dev

# Terminal 3 - Orders Service
cd services/orders-service && npm run dev

# Terminal 4 - API Gateway
cd services/api-gateway && npm run dev
```

Or use Docker Compose:
```bash
docker-compose up
```

## Adding New Vulnerabilities

When adding new vulnerabilities:

1. **Document the vulnerability** in `VULNERABILITY_CATALOG.md`:
   - Severity level
   - Location in code
   - Example exploit
   - Impact

2. **Add comments** in code indicating the vulnerability:
   ```typescript
   // Vulnerability: SQL Injection - user input not sanitized
   const query = `SELECT * FROM users WHERE username = '${username}'`;
   ```

3. **Include test cases** that demonstrate the vulnerability can be triggered

4. **Update README** if needed to document the new vulnerability type

## Code Style

- Use TypeScript for all code
- Follow existing patterns in the codebase
- Maintain intentional vulnerabilities (this is the point!)
- Comment vulnerabilities clearly

## Testing Changes

Before submitting a PR:

1. Ensure all packages build: `npm run build --workspaces`
2. Run all tests: `npm test --workspaces`
3. Verify services start without errors
4. Test that vulnerabilities are still exploitable

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-vulnerability`
3. Make your changes
4. Build and test
5. Update documentation
6. Submit a pull request

## What NOT to Contribute

- **Security fixes**: This repository is intentionally vulnerable
- **Production-ready code**: This is for testing only
- **Real credentials**: Even though we have fake credentials, don't add real ones

## Questions?

Open an issue on GitHub for questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
