import request from 'supertest';
import app from '../../src/app';

describe('Authentication Integration Tests', () => {
  test('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
  });

  test('should login with valid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  test('should reject login with invalid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('should access protected route with valid token', async () => {
    // First login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      .expect(200);

    const token = loginResponse.body.token;

    // Then access protected route
    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');
  });

  test('should reject access to protected route without token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/profile')
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});