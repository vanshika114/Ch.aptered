/**
 * Integration test suite for the health check API.
 * Verifies that the server responds correctly to health requests.
 */
import request from 'supertest';
import { app } from '../index';

describe('GET /api/health', () => {
  it('should return 200 OK with correct status payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Chaptered API is running',
    });
  });
});
