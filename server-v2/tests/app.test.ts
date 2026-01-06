import request from 'supertest';
import app from '../src/app';

describe('Application Tests', () => {
  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
  });

  test('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);
  });
});
