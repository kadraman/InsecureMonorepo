import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Vulnerability: Weak JWT secret
const JWT_SECRET = 'secret123';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export class AuthService {
  // Vulnerability: Using weak/hardcoded secret
  private jwtSecret: string = JWT_SECRET;

  // Vulnerability: Weak JWT signing with 'none' algorithm allowed
  generateToken(user: User, algorithm: string = 'HS256'): string {
    // Vulnerability: Accepting algorithm from user input
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      this.jwtSecret,
      {
        algorithm: algorithm as jwt.Algorithm,
        expiresIn: '7d' // Vulnerability: Long expiration time
      }
    );
  }

  // Vulnerability: No signature verification
  verifyToken(token: string): any {
    try {
      // Vulnerability: verify options missing, allows 'none' algorithm
      return jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256', 'none'] // Vulnerability: Accepting 'none' algorithm
      });
    } catch (error) {
      return null;
    }
  }

  // Vulnerability: Token decoded without verification
  decodeTokenUnsafe(token: string): any {
    // Vulnerability: Decoding without verification
    return jwt.decode(token, { complete: true });
  }

  // Vulnerability: Weak password hashing
  async hashPassword(password: string): Promise<string> {
    // Vulnerability: Low salt rounds (should be at least 12)
    const saltRounds = 4;
    return bcrypt.hash(password, saltRounds);
  }

  // Vulnerability: Timing attack on password comparison
  async comparePasswordUnsafe(password: string, hash: string): Promise<boolean> {
    // Vulnerability: Using string comparison instead of constant-time comparison
    const passwordHash = await bcrypt.hash(password, 4);
    return passwordHash === hash;
  }

  // Better but still has issues
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Vulnerability: Session management without expiry
  createSession(userId: string): string {
    // Vulnerability: Session token without expiry or rotation
    return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
  }

  // Vulnerability: Insecure session validation
  validateSession(sessionToken: string): string | null {
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      // Vulnerability: No expiry check
      return userId;
    } catch {
      return null;
    }
  }

  // Vulnerability: Authorization bypass
  checkPermission(user: any, requiredRole: string): boolean {
    // Vulnerability: Using == instead of === for comparison
    // Vulnerability: Not checking if user.role exists
    return user.role == requiredRole;
  }

  // Vulnerability: Insecure password reset token
  generatePasswordResetToken(email: string): string {
    // Vulnerability: Predictable token generation
    return Buffer.from(`${email}:${new Date().getTime()}`).toString('base64');
  }
}

export default AuthService;
