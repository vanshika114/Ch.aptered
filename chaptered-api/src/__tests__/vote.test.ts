import request from 'supertest';
import { app } from '../index';
import { Vote } from '../models/Vote';
import { Club } from '../models/Club';

jest.mock('../models/Vote');
jest.mock('../models/Club');

jest.mock('../middleware/auth', () => ({
  auth: (req: any, _res: any, next: any) => {
    req.user = { id: 'user1' };
    next();
  },
  AuthRequest: {} as any,
}));

const token = 'Bearer mock-token';

const mockClub = {
  _id: 'club1',
  members: ['user1'],
};

const mockVote = {
  _id: 'vote1',
  clubId: 'club1',
  userId: 'user1',
  nomineeId: 'book1',
  nomineeTitle: 'Test Book',
  save: jest.fn().mockResolvedValue(true),
};

describe('Vote API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/votes/:clubId', () => {
    it('should cast a vote successfully', async () => {
      (Club.findById as jest.Mock).mockResolvedValue(mockClub);
      (Vote.findOne as jest.Mock).mockResolvedValue(null);
      (Vote.prototype.save as jest.Mock).mockResolvedValue(mockVote);

      const res = await request(app)
        .post('/api/votes/club1')
        .set('Authorization', token)
        .send({ nomineeId: 'book1', nomineeTitle: 'Test Book' });

      expect(res.status).toBe(201);
    });

    it('should return 403 if not a member', async () => {
      (Club.findById as jest.Mock).mockResolvedValue({ _id: 'club2', members: ['otheruser'] });

      const res = await request(app)
        .post('/api/votes/club2')
        .set('Authorization', token)
        .send({ nomineeId: 'book1', nomineeTitle: 'Test Book' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/votes/:clubId', () => {
    it('should return vote tally', async () => {
      (Club.findById as jest.Mock).mockResolvedValue(mockClub);
      const sortFn = jest.fn().mockResolvedValue([
        { nomineeId: 'book1', nomineeTitle: 'Test Book', userId: { _id: 'u1', username: 'user1' } },
      ]);
      const populateFn = jest.fn().mockReturnValue({ sort: sortFn });
      (Vote.find as jest.Mock).mockReturnValue({ populate: populateFn });

      const res = await request(app)
        .get('/api/votes/club1')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body.tally).toHaveLength(1);
    });
  });
});
