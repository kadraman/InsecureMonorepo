import request from 'supertest';
import app from '../src/index';

describe('Users Service API', () => {
  test('POST /api/users - should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.username).toBe('testuser');
  });

  test('POST /api/users/login - should login user', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('GET /api/users/search - should search users', async () => {
    const response = await request(app)
      .get('/api/users/search?username=admin');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/users/:id - should get user by id', async () => {
    const response = await request(app)
      .get('/api/users/1');
    
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('admin');
  });

  test('PUT /api/users/:id/role - should update user role', async () => {
    const response = await request(app)
      .put('/api/users/1/role')
      .send({ role: 'superadmin' });
    
    expect(response.status).toBe(200);
  });
});
