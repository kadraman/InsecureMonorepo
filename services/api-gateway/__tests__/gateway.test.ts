import request from 'supertest';
import app from '../src/index';

describe('API Gateway', () => {
  test('GET /health - should return health status', async () => {
    const response = await request(app)
      .get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('GET /api/services - should return service URLs', async () => {
    const response = await request(app)
      .get('/api/services');
    
    expect(response.status).toBe(200);
    expect(response.body.users).toBeDefined();
    expect(response.body.products).toBeDefined();
    expect(response.body.orders).toBeDefined();
  });

  test('GET /api/debug - should return debug info', async () => {
    const response = await request(app)
      .get('/api/debug');
    
    expect(response.status).toBe(200);
    expect(response.body.config).toBeDefined();
    expect(response.body.services).toBeDefined();
  });

  test('POST /api/upload - should upload file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .send({
        filename: 'test.txt',
        content: 'test content'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('File uploaded');
  });

  test('POST /api/graphql - should accept GraphQL query', async () => {
    const response = await request(app)
      .post('/api/graphql')
      .send({
        query: '{ __schema { types { name } } }'
      });
    
    expect(response.status).toBe(200);
  });
});
