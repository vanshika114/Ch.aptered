/**
 * Integration test suite for the Reading Session API endpoints.
 * Direct assignments are used to mock database queries and save actions, ensuring test speed and stability.
 */
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { User } from '../models/User';
import { ReadingSession } from '../models/ReadingSession';

// Mock mongoose connect to avoid connecting to the database
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
      close: jest.fn().mockResolvedValue(true),
    },
  };
});

describe('Reading Session API Integration Tests', () => {
  let token1: string;
  let token2: string;
  const userId1 = new mongoose.Types.ObjectId().toString();
  const userId2 = new mongoose.Types.ObjectId().toString();
  const testSessionId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    token1 = jwt.sign({ userId: userId1 }, secret, { expiresIn: '1h' });
    token2 = jwt.sign({ userId: userId2 }, secret, { expiresIn: '1h' });

    // Directly override prototype methods to mock save and deleteOne
    ReadingSession.prototype.save = jest.fn().mockImplementation(function (this: any) {
      if (!this._id) {
        this._id = testSessionId;
      }
      return Promise.resolve(this);
    });
    ReadingSession.prototype.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    User.prototype.save = jest.fn().mockResolvedValue(true);

    // Directly override static query methods with mock functions
    ReadingSession.findOne = jest.fn().mockResolvedValue(null);
    ReadingSession.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    } as any);
    ReadingSession.findById = jest.fn().mockResolvedValue(null);
    ReadingSession.countDocuments = jest.fn().mockResolvedValue(0);

    User.findOne = jest.fn().mockResolvedValue(null);
    User.findById = jest.fn().mockResolvedValue(null);
  });

  afterEach(() => {
    // Reset call counts and clear mocks between tests
    jest.clearAllMocks();
  });

  describe('POST /api/sessions (Create Session)', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ bookId: '123', bookTitle: 'Test Book' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if bookId or bookTitle is missing', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token1}`)
        .send({ bookId: '', bookTitle: '' });
      
      expect(res.status).toBe(400);
      expect(res.body.errors.bookId).toBeDefined();
      expect(res.body.errors.bookTitle).toBeDefined();
    });

    it('should successfully create a new reading session', async () => {
      (ReadingSession.findOne as jest.Mock).mockResolvedValue(null); // No active session

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          bookId: 'book_1',
          bookTitle: 'The Great Gatsby',
          bookAuthor: 'F. Scott Fitzgerald',
          pagesRead: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body._id).toBeDefined();
      expect(res.body.bookTitle).toBe('The Great Gatsby');
      expect(res.body.pagesRead).toBe(10);
      expect(res.body.status).toBe('reading');
    });

    it('should return 409 Conflict if creating an active session for the same book', async () => {
      (ReadingSession.findOne as jest.Mock).mockResolvedValue({
        _id: 'existing_active_id',
        userId: userId1,
        bookId: 'book_1',
        status: 'reading',
      });

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          bookId: 'book_1',
          bookTitle: 'The Great Gatsby',
        });
      
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('active reading session');
    });
  });

  describe('GET /api/sessions (Get Sessions)', () => {
    it('should return all sessions for the authenticated user', async () => {
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          {
            _id: testSessionId,
            userId: userId1,
            bookId: 'book_1',
            bookTitle: 'The Great Gatsby',
            pagesRead: 10,
            status: 'reading',
          },
        ]),
      };
      (ReadingSession.find as jest.Mock).mockReturnValue(mockChain as any);
      (ReadingSession.countDocuments as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.sessions).toBeDefined();
      expect(res.body.sessions.length).toBe(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('PATCH /api/sessions/:id (Update Session)', () => {
    it('should return 403 Forbidden if updating someone else\'s session', async () => {
      (ReadingSession.findById as jest.Mock).mockResolvedValue({
        _id: testSessionId,
        userId: userId1,
      } as any);

      const res = await request(app)
        .patch(`/api/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ pagesRead: 20 });

      expect(res.status).toBe(403);
    });

    it('should update the session if requested by the owner', async () => {
      const mockSaveInstance = jest.fn().mockImplementation(function (this: any) {
        this.pagesRead = 25;
        this.status = 'completed';
        return Promise.resolve(this);
      });

      (ReadingSession.findById as jest.Mock).mockResolvedValue({
        _id: testSessionId,
        userId: userId1,
        bookId: 'book_1',
        bookTitle: 'The Great Gatsby',
        pagesRead: 10,
        status: 'reading',
        save: mockSaveInstance,
      } as any);

      const res = await request(app)
        .patch(`/api/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ pagesRead: 25, status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.pagesRead).toBe(25);
      expect(res.body.status).toBe('completed');
    });
  });

  describe('DELETE /api/sessions/:id (Delete Session)', () => {
    it('should return 403 Forbidden if deleting someone else\'s session', async () => {
      (ReadingSession.findById as jest.Mock).mockResolvedValue({
        _id: testSessionId,
        userId: userId1,
      } as any);

      const res = await request(app)
        .delete(`/api/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
    });

    it('should delete the session if requested by the owner', async () => {
      const mockDeleteOneInstance = jest.fn().mockResolvedValue({ deletedCount: 1 });

      (ReadingSession.findById as jest.Mock).mockResolvedValue({
        _id: testSessionId,
        userId: userId1,
        deleteOne: mockDeleteOneInstance,
      } as any);

      const res = await request(app)
        .delete(`/api/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should return 404 if session not found', async () => {
      (ReadingSession.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/sessions/invalid_id`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(404);
    });
  });
});
