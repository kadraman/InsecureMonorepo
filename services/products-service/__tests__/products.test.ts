import request from 'supertest';
import app from '../src/index';

describe('Products Service API', () => {
  test('GET /api/products - should get all products', async () => {
    const response = await request(app)
      .get('/api/products');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /api/products/:id - should get product by id', async () => {
    const response = await request(app)
      .get('/api/products/1');
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
  });

  test('POST /api/products - should create a new product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Test',
        stock: 10
      });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Product');
  });

  test('GET /api/products/search - should search products', async () => {
    const response = await request(app)
      .get('/api/products/search?query=Laptop');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/products/filter - should filter products by price', async () => {
    const response = await request(app)
      .get('/api/products/filter?minPrice=0&maxPrice=1000');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('DELETE /api/products/:id - should delete product', async () => {
    const response = await request(app)
      .delete('/api/products/1');
    
    expect(response.status).toBe(200);
  });
});
