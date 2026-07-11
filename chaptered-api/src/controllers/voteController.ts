import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Vote } from '../models/Vote';
import { Club } from '../models/Club';

export const castVote = async (req: AuthRequest, res: Response): Promise<any> => {
  const { nomineeId, nomineeTitle, nomineeAuthor, nomineeCoverUrl } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (!club.members.some((m: any) => String(m) === userId)) {
      return res.status(403).json({ error: 'Only members can vote' });
    }

    if (!nomineeId || !nomineeTitle) {
      return res.status(400).json({ errors: { nomineeId: 'nomineeId is required', nomineeTitle: 'nomineeTitle is required' } });
    }

    const existing = await Vote.findOne({ clubId: req.params.clubId, userId });
    if (existing) {
      existing.nomineeId = nomineeId;
      existing.nomineeTitle = nomineeTitle;
      existing.nomineeAuthor = nomineeAuthor;
      existing.nomineeCoverUrl = nomineeCoverUrl;
      await existing.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`club:${req.params.clubId}`).emit('vote_update', { clubId: req.params.clubId });
      }

      return res.json(existing);
    }

    const vote = new Vote({
      clubId: req.params.clubId,
      userId,
      nomineeId,
      nomineeTitle,
      nomineeAuthor,
      nomineeCoverUrl,
    });
    await vote.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`club:${req.params.clubId}`).emit('vote_update', { clubId: req.params.clubId });
    }

    return res.status(201).json(vote);
  } catch (error) {
    console.error('[Cast Vote Error]:', error);
    return res.status(500).json({ error: 'Server error casting vote.' });
  }
};

export const getVotes = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const votes = await Vote.find({ clubId: req.params.clubId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    const tally: Record<string, { count: number; title: string; author?: string; coverUrl?: string; voters: string[] }> = {};
    votes.forEach((v: any) => {
      if (!tally[v.nomineeId]) {
        tally[v.nomineeId] = { count: 0, title: v.nomineeTitle, author: v.nomineeAuthor, coverUrl: v.nomineeCoverUrl, voters: [] };
      }
      tally[v.nomineeId].count++;
      tally[v.nomineeId].voters.push((v.userId as any).username || 'Unknown');
    });

    const sorted = Object.entries(tally)
      .map(([nomineeId, data]) => ({ nomineeId, ...data }))
      .sort((a, b) => b.count - a.count);

    return res.json({ votes, tally: sorted });
  } catch (error) {
    console.error('[Get Votes Error]:', error);
    return res.status(500).json({ error: 'Server error fetching votes.' });
  }
};

export const getUserVote = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const vote = await Vote.findOne({ clubId: req.params.clubId, userId });
    return res.json({ vote });
  } catch (error) {
    console.error('[Get User Vote Error]:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};
