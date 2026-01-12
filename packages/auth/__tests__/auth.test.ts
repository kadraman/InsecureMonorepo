import AuthService from '../src/index';

describe('AuthService', () => {
  let authService: AuthService;
  const testUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  };

  beforeEach(() => {
    authService = new AuthService();
  });

  test('should generate JWT token', () => {
    const token = authService.generateToken(testUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should verify JWT token', () => {
    const token = authService.generateToken(testUser);
    const decoded = authService.verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.username).toBe('testuser');
  });

  test('should decode token without verification', () => {
    const token = authService.generateToken(testUser);
    const decoded = authService.decodeTokenUnsafe(token);
    expect(decoded).toBeDefined();
  });

  test('should hash password', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });

  test('should compare passwords', async () => {
    const password = 'testPassword123';
    const hash = await authService.hashPassword(password);
    const isMatch = await authService.comparePassword(password, hash);
    expect(isMatch).toBe(true);
  });

  test('should create session', () => {
    const session = authService.createSession('user123');
    expect(session).toBeDefined();
    expect(typeof session).toBe('string');
  });

  test('should validate session', () => {
    const session = authService.createSession('user123');
    const userId = authService.validateSession(session);
    expect(userId).toBe('user123');
  });

  test('should check permission', () => {
    const hasPermission = authService.checkPermission(testUser, 'user');
    expect(hasPermission).toBe(true);
  });

  test('should generate password reset token', () => {
    const token = authService.generatePasswordResetToken('test@example.com');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
