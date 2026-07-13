import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const notifications = await Notification.find({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    return res.json({ notifications: notifications.slice(0, 50), unreadCount });
  } catch (error) {
    console.error('[Get Notifications Error]:', error);
    return res.status(500).json({ error: 'Server error fetching notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const notif = Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    if (notif.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    notif.isRead = true;
    notif.save();
    return res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('[Mark Read Error]:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const notifs = Notification.find({ userId, isRead: false });
    notifs.forEach((n: any) => {
      n.isRead = true;
      n.save();
    });
    return res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('[Mark All Read Error]:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
};

export async function createNotification(
  userId: string,
  type: string,
  message: string,
  relatedClubId?: string,
  io?: any,
) {
  try {
    const notif = Notification.create({ userId, type, message, relatedClubId: relatedClubId || null });
    if (io) {
      io.to(`user:${userId}`).emit('notification', notif);
    }
    return notif;
  } catch (error) {
    console.error('[Create Notification Error]:', error);
  }
}
