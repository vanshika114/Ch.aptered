import request from 'supertest';
import { app } from '../index';
import { Club } from '../models/Club';

jest.mock('../models/Club');

jest.mock('../middleware/auth', () => ({
  auth: (req: any, _res: any, next: any) => {
    req.user = { id: 'user1' };
    next();
  },
  AuthRequest: {} as any,
}));

const token = 'Bearer mock-token';

describe('Club API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/clubs', () => {
    it('should create a club successfully', async () => {
      const mockClub = { _id: 'club1', name: 'Test Club', description: 'A test club', isPublic: true, owner: 'user1', members: ['user1'] };
      (Club as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockClub),
        populate: jest.fn().mockResolvedValue(mockClub),
      }));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', token)
        .send({ name: 'Test Club', description: 'A test club' });

      expect(res.status).toBe(201);
    });

    it('should return 400 if name is too short', async () => {
      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', token)
        .send({ name: 'A', description: 'Test' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/clubs', () => {
    it('should return list of clubs', async () => {
      (Club.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: 'club1', name: 'Test Club' }]),
      });
      (Club.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/clubs')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.clubs).toHaveLength(1);
    });
  });
});
