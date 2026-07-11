import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Club } from '../models/Club';
import { createNotification } from './notificationController';
import { getDb } from '../db/sqlite-init';

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

function memberRole(club: any, userId: string): string | null {
  if (!club.members) return null;
  return club.memberRoles?.[userId] || null;
}

function isAdmin(club: any, userId: string): boolean {
  return memberRole(club, userId) === 'admin';
}

function isMember(club: any, userId: string): boolean {
  if (!club.members) return false;
  return club.members.some((m: any) => String(m) === userId);
}

function adminCount(club: any): number {
  if (!club.members) return 0;
  if (club.memberRoles) {
    return Object.values(club.memberRoles).filter((r) => r === 'admin').length;
  }
  return 0;
}

export const createClub = async (req: AuthRequest, res: Response): Promise<any> => {
  const { name, description, type } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const errors: Record<string, string> = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!description || description.trim().length < 1) errors.description = 'Description is required';
  if (!['public', 'semi_private', 'private'].includes(type || 'public')) errors.type = 'Invalid club type';
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const club = new Club({
      name: name.trim(),
      description: description.trim(),
      type: type || 'public',
      inviteCode: type === 'private' ? generateInviteCode() : null,
      owner: userId,
      members: [userId],
      memberRoles: { [userId]: 'admin' },
    });
    await club.save();
    const db = getDb();
    if (db) {
      db.prepare(`UPDATE club_members SET role = 'admin' WHERE clubId = ? AND userId = ?`).run(club._id, userId);
    }
    await club.populate('members', 'username email');
    return res.status(201).json(club);
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ error: 'A club with this name already exists' });
    console.error('[Create Club Error]:', error);
    return res.status(500).json({ error: 'Server error creating club.' });
  }
};

export const getClubs = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const { mine, page, limit } = req.query;

  try {
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    let clubs: any[];

    if (mine === 'true') {
      clubs = await Club.find({ members: userId })
        .populate('owner', 'username')
        .populate('members', 'username email')
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(99999);
    } else {
      clubs = await Club.find({})
        .populate('owner', 'username')
        .populate('members', 'username email')
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(99999);
      clubs = clubs.filter((c: any) => c.type !== 'private');
    }

    const paginated = clubs.slice(skip, skip + limitNum);
    const total = clubs.length;

    return res.json({
      clubs: paginated,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('[Get Clubs Error]:', error);
    return res.status(500).json({ error: 'Server error fetching clubs.' });
  }
};

export const getClubById = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  try {
    const club = await Club.findById(req.params.id as string)
      .populate('owner', 'username email')
      .populate('members', 'username email');
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const userIsAdmin = userId ? isAdmin(club, userId) : false;

    let pendingRequests: any[] = [];
    if (userIsAdmin && DB_TYPE !== 'mongodb') {
      
      const db = getDb();
      pendingRequests = db.prepare(
        `SELECT cm.userId, cm.role, cm.status, u._id, u.username, u.email
         FROM club_members cm JOIN users u ON u._id = cm.userId
         WHERE cm.clubId = ? AND cm.status = 'pending_approval'`
      ).all(club._id);
    }

    return res.json({ ...club, pendingRequests });
  } catch (error) {
    console.error('[Get Club Error]:', error);
    return res.status(500).json({ error: 'Server error fetching club.' });
  }
};

export const joinClub = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    if (club.type === 'private') {
      return res.status(403).json({ error: 'This club is private. Use an invite code to join.' });
    }

    if (isMember(club, userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    if (club.type === 'public') {
      club.members.push(userId);
      await club.save();
      
      const db = getDb();
      db.prepare(
        `INSERT OR REPLACE INTO club_members (clubId, userId, role, status) VALUES (?, ?, ?, ?)`
      ).run(club._id, userId, 'member', 'active');
      await club.populate('members', 'username email');
      return res.json(club);
    }

    if (club.type === 'semi_private') {
      
      const db = getDb();
      db.prepare(
        `INSERT OR REPLACE INTO club_members (clubId, userId, role, status) VALUES (?, ?, ?, ?)`
      ).run(club._id, userId, 'member', 'pending_approval');
      return res.json({ message: 'Join request sent. Awaiting admin approval.' });
    }

    return res.status(400).json({ error: 'Unknown club type' });
  } catch (error) {
    console.error('[Join Club Error]:', error);
    return res.status(500).json({ error: 'Server error joining club.' });
  }
};

export const requestJoin = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.type === 'public') {
      return res.status(400).json({ error: 'Public clubs do not need requests. Use the normal join endpoint.' });
    }
    if (isMember(club, userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    
    const db = getDb();

    const existing = db.prepare(
      `SELECT * FROM club_members WHERE clubId = ? AND userId = ?`
    ).get(club._id, userId) as any;

    if (existing) {
      if (existing.status === 'pending_approval') {
        return res.status(400).json({ error: 'Join request already pending' });
      }
      return res.status(400).json({ error: 'Already a member' });
    }

    db.prepare(
      `INSERT INTO club_members (clubId, userId, role, status) VALUES (?, ?, ?, ?)`
    ).run(club._id, userId, 'member', 'pending_approval');

    const io = req.app.get('io');
    const db2 = getDb();
    const admins = db2.prepare(
      `SELECT cm.userId, u.username FROM club_members cm JOIN users u ON u._id = cm.userId WHERE cm.clubId = ? AND cm.role = 'admin'`
    ).all(club._id) as any[];
    const requester = db2.prepare(`SELECT username FROM users WHERE _id = ?`).get(userId) as any;

    for (const admin of admins) {
      createNotification(admin.userId, 'join_request', `${requester?.username || 'Someone'} wants to join ${club.name}`, club._id, io);
    }

    return res.json({ message: 'Join request sent. Awaiting admin approval.' });
  } catch (error) {
    console.error('[Request Join Error]:', error);
    return res.status(500).json({ error: 'Server error processing request.' });
  }
};

export const approveJoin = async (req: AuthRequest, res: Response): Promise<any> => {
  const adminId = req.user?.id;
  const userId = req.params.userId as string;
  if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, adminId)) return res.status(403).json({ error: 'Only admins can approve requests' });

    
    const db = getDb();

    const existing = db.prepare(
      `SELECT * FROM club_members WHERE clubId = ? AND userId = ?`
    ).get(club._id, userId) as any;

    if (!existing) return res.status(404).json({ error: 'No join request found' });
    if (existing.status !== 'pending_approval') return res.status(400).json({ error: 'Request is not pending' });

    db.prepare(
      `UPDATE club_members SET status = 'active' WHERE clubId = ? AND userId = ?`
    ).run(club._id, userId);

    if (!club.members.some((m: any) => String(m) === userId)) {
      club.members.push(userId);
      await club.save();
    }

    const io = req.app.get('io');
    createNotification(userId, 'join_approved', `Your request to join ${club.name} has been approved`, club._id, io);

    return res.json({ message: 'Join request approved' });
  } catch (error) {
    console.error('[Approve Join Error]:', error);
    return res.status(500).json({ error: 'Server error approving request.' });
  }
};

export const rejectJoin = async (req: AuthRequest, res: Response): Promise<any> => {
  const adminId = req.user?.id;
  const userId = req.params.userId as string;
  if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, adminId)) return res.status(403).json({ error: 'Only admins can reject requests' });

    
    const db = getDb();

    const existing = db.prepare(
      `SELECT * FROM club_members WHERE clubId = ? AND userId = ?`
    ).get(club._id, userId) as any;

    if (!existing) return res.status(404).json({ error: 'No join request found' });

    db.prepare(
      `DELETE FROM club_members WHERE clubId = ? AND userId = ?`
    ).run(club._id, userId);

    const io = req.app.get('io');
    createNotification(userId, 'join_rejected', `Your request to join ${club.name} was not approved`, club._id, io);

    return res.json({ message: 'Join request rejected' });
  } catch (error) {
    console.error('[Reject Join Error]:', error);
    return res.status(500).json({ error: 'Server error rejecting request.' });
  }
};

export const leaveClub = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    if (isAdmin(club, userId) && adminCount(club) <= 1) {
      return res.status(400).json({ error: 'Cannot leave. Promote another admin first or delete the club.' });
    }

    club.members = club.members.filter((m: any) => String(m) !== userId);
    await club.save();

    
    const db = getDb();
    db.prepare(`DELETE FROM club_members WHERE clubId = ? AND userId = ?`).run(club._id, userId);

    return res.json({ message: 'Left club successfully' });
  } catch (error) {
    console.error('[Leave Club Error]:', error);
    return res.status(500).json({ error: 'Server error leaving club.' });
  }
};

export const promoteToAdmin = async (req: AuthRequest, res: Response): Promise<any> => {
  const adminId = req.user?.id;
  const userId = req.params.userId as string;
  if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, adminId)) return res.status(403).json({ error: 'Only admins can promote members' });
    if (!isMember(club, userId)) return res.status(400).json({ error: 'User is not a member' });

    
    const db = getDb();
    db.prepare(
      `UPDATE club_members SET role = 'admin' WHERE clubId = ? AND userId = ?`
    ).run(club._id, userId);

    const io = req.app.get('io');
    createNotification(userId, 'promoted_admin', `You are now an admin of ${club.name}`, club._id, io);

    return res.json({ message: 'Member promoted to admin' });
  } catch (error) {
    console.error('[Promote Admin Error]:', error);
    return res.status(500).json({ error: 'Server error promoting member.' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<any> => {
  const adminId = req.user?.id;
  const userId = req.params.userId as string;
  if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, adminId)) return res.status(403).json({ error: 'Only admins can remove members' });

    if (isAdmin(club, userId) && adminCount(club) <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin. Promote another admin first.' });
    }

    club.members = club.members.filter((m: any) => String(m) !== userId);
    await club.save();

    
    const db = getDb();
    db.prepare(`DELETE FROM club_members WHERE clubId = ? AND userId = ?`).run(club._id, userId);

    const io = req.app.get('io');
    createNotification(userId, 'removed_from_club', `You have been removed from ${club.name}`, club._id, io);

    return res.json({ message: 'Member removed from club' });
  } catch (error) {
    console.error('[Remove Member Error]:', error);
    return res.status(500).json({ error: 'Server error removing member.' });
  }
};

export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, userId)) return res.status(403).json({ error: 'Only admins can view pending requests' });

    
    const db = getDb();
    const requests = db.prepare(
      `SELECT cm.userId, cm.role, cm.status, u._id, u.username, u.email
       FROM club_members cm JOIN users u ON u._id = cm.userId
       WHERE cm.clubId = ? AND cm.status = 'pending_approval'
       ORDER BY cm.rowid ASC`
    ).all(club._id);

    return res.json({ requests });
  } catch (error) {
    console.error('[Get Pending Requests Error]:', error);
    return res.status(500).json({ error: 'Server error fetching requests.' });
  }
};

export const generateInviteCodeForClub = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, userId)) return res.status(403).json({ error: 'Only admins can generate invite codes' });

    const code = generateInviteCode();
    club.inviteCode = code;
    await club.save();

    return res.json({ inviteCode: code });
  } catch (error) {
    console.error('[Generate Invite Error]:', error);
    return res.status(500).json({ error: 'Server error generating invite code.' });
  }
};

export const joinByInviteCode = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  const { inviteCode } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!inviteCode) return res.status(400).json({ error: 'Invite code is required' });

  try {
    
    const db = getDb();
    const row = db.prepare(`SELECT * FROM clubs WHERE invite_code = ?`).get(inviteCode) as any;

    if (!row) return res.status(404).json({ error: 'Invalid invite code' });

    const club = Club.findById(row._id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    if (isMember(club, userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    const existing = db.prepare(
      `SELECT * FROM club_members WHERE clubId = ? AND userId = ?`
    ).get(club._id, userId) as any;

    if (existing?.status === 'pending_approval') {
      return res.status(400).json({ error: 'Join request already pending' });
    }

    if (club.type === 'private') {
      club.members.push(userId);
      await club.save();
      db.prepare(
        `INSERT OR REPLACE INTO club_members (clubId, userId, role, status) VALUES (?, ?, ?, ?)`
      ).run(club._id, userId, 'member', 'active');
      await club.populate('members', 'username email');
      return res.json({ message: 'Joined club successfully', club });
    }

    return res.status(400).json({ error: 'Invite codes are only for private clubs' });
  } catch (error) {
    console.error('[Join By Invite Error]:', error);
    return res.status(500).json({ error: 'Server error joining club.' });
  }
};

export const updateClubBook = async (req: AuthRequest, res: Response): Promise<any> => {
  const { bookId, title, author, coverUrl } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.id as string);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!isAdmin(club, userId)) return res.status(403).json({ error: 'Only admins can set the current book' });

    club.currentBook = bookId ? { bookId, title, author, coverUrl } : undefined;
    await club.save();
    return res.json(club);
  } catch (error) {
    console.error('[Update Club Book Error]:', error);
    return res.status(500).json({ error: 'Server error updating club book.' });
  }
};

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
