import request from 'supertest';
import app from '../src/index';

describe('Orders Service API', () => {
  let orderId: number;

  test('POST /api/orders - should create a new order', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        userId: 1,
        productId: 1,
        quantity: 2
      });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    orderId = response.body.id;
  });

  test('GET /api/orders/:id - should get order by id', async () => {
    const response = await request(app)
      .get(`/api/orders/${orderId}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orderId);
  });

  test('GET /api/orders - should get all orders', async () => {
    const response = await request(app)
      .get('/api/orders');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('PUT /api/orders/:id - should update order', async () => {
    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send({
        quantity: 3,
        status: 'processing'
      });
    
    expect(response.status).toBe(200);
  });

  test('POST /api/orders/:id/payment - should process payment', async () => {
    const response = await request(app)
      .post(`/api/orders/${orderId}/payment`)
      .send({
        amount: 200,
        cardNumber: '4111111111111111',
        cvv: '123',
        expiryDate: '12/25'
      });
    
    expect(response.status).toBe(200);
  });

  test('GET /api/orders/user/:userId - should get user orders', async () => {
    const response = await request(app)
      .get('/api/orders/user/1');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
