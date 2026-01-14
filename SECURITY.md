# Security Policy

## ⚠️ Important Notice

**This repository contains intentionally vulnerable code for security testing and educational purposes.**

## Purpose

This repository is designed to:
- Demonstrate common security vulnerabilities in Node.js/TypeScript applications
- Test security scanning tools (GitHub Advanced Security, Fortify, etc.)
- Provide a training environment for security professionals
- Show examples of what NOT to do in production code

## What This Repository Is NOT

This repository is **NOT**:
- Production-ready code
- Meant to be deployed on the internet
- A template for real applications
- Secure in any way

## Known Vulnerabilities

This repository contains **intentional** vulnerabilities including but not limited to:

### Critical Vulnerabilities
- SQL Injection
- Command Injection  
- Hardcoded credentials
- Insecure JWT implementation
- Server-Side Request Forgery (SSRF)
- XML External Entity (XXE) injection

### High Vulnerabilities
- Insecure Direct Object Reference (IDOR)
- Path Traversal
- Insecure deserialization
- Weak password hashing
- Sensitive data exposure

### Medium Vulnerabilities
- CORS misconfiguration
- Missing authorization checks
- Information disclosure
- Business logic flaws

For a complete list, see [VULNERABILITY_CATALOG.md](VULNERABILITY_CATALOG.md).

## DO NOT Report Security Issues

**Do not report security vulnerabilities in this repository as they are intentional.**

This repository is meant to have vulnerabilities. If you find a vulnerability, it's working as designed!

## Responsible Use

If you use this repository:

1. **Never deploy to production**
2. **Never expose to the internet**
3. **Only use in isolated test environments**
4. **Do not use real credentials or data**
5. **Follow your organization's security policies**

## Usage Guidelines

### ✅ Acceptable Use
- Security tool testing
- Security training and education
- DevSecOps demonstrations
- Learning about vulnerabilities
- Academic research

### ❌ Unacceptable Use
- Deploying to production
- Exposing to public internet
- Using with real user data
- Attacking systems without authorization
- Incorporating into production applications

## Legal Disclaimer

By using this repository, you agree:

- You understand this code is intentionally vulnerable
- You will not use this code for malicious purposes
- You will not deploy this code in production
- You will not expose this code to the internet
- You will use this code responsibly and ethically
- You will follow all applicable laws and regulations

## Testing Tools

This repository is designed to be tested with:

- GitHub Advanced Security (CodeQL)
- Fortify/OpenText Static Code Analyzer
- OWASP ZAP
- Burp Suite
- Snyk
- npm audit
- Any other security scanning tools

## Educational Resources

For learning about secure coding practices (the opposite of this repo):

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/projects/ssdf)

## Questions?

If you have questions about:
- **Using this repository**: Open a GitHub issue
- **Security testing**: See [EXAMPLES.md](EXAMPLES.md)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Vulnerabilities**: See [VULNERABILITY_CATALOG.md](VULNERABILITY_CATALOG.md)

## License

This repository is provided under the MIT License for educational purposes only.

---

**Remember: This code is intentionally insecure. Do not use in production!**
