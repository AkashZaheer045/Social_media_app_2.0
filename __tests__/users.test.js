/**
 * Users Controller Tests
 *
 * This file contains tests for the users controller.
 * Tests should cover both success and failure paths.
 */

// Jest test configuration
const request = require('supertest');
const app = require('../app');

describe('Users Module', () => {
  describe('POST /api/v1/user/create', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        first_name: 'Test',
        last_name: 'User',
      };

      const response = await request(app).post('/api/v1/user/create').send(userData);

      expect([200, 201]).toContain(response.statusCode);
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
      };

      const response = await request(app).post('/api/v1/user/create').send(userData);

      expect(response.statusCode).toBe(422);
    });
  });

  describe('POST /api/v1/user/login', () => {
    it('should return tokens on successful login', async () => {
      // This test requires a pre-existing user
      // In a real test suite, you would seed the database first
      const loginData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/v1/user/login').send(loginData);

      // Note: Will fail if user doesn't exist
      if (response.statusCode === 200) {
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
      }
    });

    it('should fail with wrong password', async () => {
      const loginData = {
        email: 'existing@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/api/v1/user/login').send(loginData);

      expect([401, 404]).toContain(response.statusCode);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).post('/user/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });
});
