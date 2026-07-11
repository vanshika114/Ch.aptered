import { create } from 'zustand';

export interface Club {
  _id: string;
  name: string;
  description: string;
  type: 'public' | 'semi_private' | 'private';
  isPublic: boolean;
  inviteCode?: string;
  owner: { _id: string; username: string };
  members: Array<{ _id: string; username: string; email: string }>;
  currentBook?: { bookId: string; title: string; author?: string; coverUrl?: string };
  pendingRequests?: Array<{ userId: string; username: string; email: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface VoteTally {
  nomineeId: string;
  count: number;
  title: string;
  author?: string;
  coverUrl?: string;
  voters: string[];
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  relatedClubId?: string;
  isRead: boolean;
  createdAt: string;
}

interface ClubStore {
  clubs: Club[];
  currentClub: Club | null;
  votes: VoteTally[];
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  unreadCount: number;

  fetchClubs: (mine?: boolean) => Promise<void>;
  fetchClub: (id: string) => Promise<void>;
  createClub: (name: string, description: string, type: string) => Promise<{ success: boolean; error?: string }>;
  joinClub: (id: string) => Promise<{ success: boolean; error?: string }>;
  requestJoin: (id: string) => Promise<{ success: boolean; error?: string }>;
  approveJoin: (clubId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  rejectJoin: (clubId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  leaveClub: (id: string) => Promise<{ success: boolean; error?: string }>;
  promoteToAdmin: (clubId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (clubId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  generateInviteCode: (clubId: string) => Promise<{ success: boolean; inviteCode?: string; error?: string }>;
  joinByInviteCode: (inviteCode: string) => Promise<{ success: boolean; error?: string }>;

  fetchVotes: (clubId: string) => Promise<void>;
  castVote: (clubId: string, nomineeId: string, nomineeTitle: string, nomineeAuthor?: string, nomineeCoverUrl?: string) => Promise<{ success: boolean; error?: string }>;
  setCurrentClub: (club: Club | null) => void;

  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (notif: Notification) => void;
}

function getToken(): string | null {
  return localStorage.getItem('chaptered-token');
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

export const useClubStore = create<ClubStore>((set, get) => ({
  clubs: [],
  currentClub: null,
  votes: [],
  loading: false,
  error: null,
  notifications: [],
  unreadCount: 0,

  fetchClubs: async (mine?: boolean) => {
    set({ loading: true, error: null });
    try {
      const res = await authFetch(`/api/clubs?mine=${mine ? 'true' : 'false'}`);
      const data = await res.json();
      if (res.ok) set({ clubs: data.clubs, loading: false });
      else set({ error: data.error || 'Failed to fetch clubs', loading: false });
    } catch {
      set({ error: 'Network error', loading: false });
    }
  },

  fetchClub: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await authFetch(`/api/clubs/${id}`);
      const data = await res.json();
      if (res.ok) set({ currentClub: data, loading: false });
      else set({ error: data.error || 'Failed to fetch club', loading: false });
    } catch {
      set({ error: 'Network error', loading: false });
    }
  },

  createClub: async (name: string, description: string, type: string) => {
    try {
      const res = await authFetch('/api/clubs', {
        method: 'POST',
        body: JSON.stringify({ name, description, type }),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.errors ? Object.values(data.errors).join(', ') : data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  joinClub: async (id: string) => {
    try {
      const res = await authFetch(`/api/clubs/${id}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  requestJoin: async (id: string) => {
    try {
      const res = await authFetch(`/api/clubs/${id}/request-join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  approveJoin: async (clubId: string, userId: string) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/approve-join/${userId}`, { method: 'POST' });
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  rejectJoin: async (clubId: string, userId: string) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/reject-join/${userId}`, { method: 'POST' });
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  leaveClub: async (id: string) => {
    try {
      const res = await authFetch(`/api/clubs/${id}/leave`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  promoteToAdmin: async (clubId: string, userId: string) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/promote-admin/${userId}`, { method: 'POST' });
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  removeMember: async (clubId: string, userId: string) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/remove-member/${userId}`, { method: 'POST' });
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  generateInviteCode: async (clubId: string) => {
    try {
      const res = await authFetch(`/api/clubs/${clubId}/generate-invite`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) return { success: true, inviteCode: data.inviteCode };
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  joinByInviteCode: async (inviteCode: string) => {
    try {
      const res = await authFetch('/api/clubs/join-by-invite', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  fetchVotes: async (clubId: string) => {
    try {
      const res = await authFetch(`/api/votes/${clubId}`);
      const data = await res.json();
      if (res.ok) set({ votes: data.tally || [] });
    } catch {
      // ignore
    }
  },

  castVote: async (clubId, nomineeId, nomineeTitle, nomineeAuthor, nomineeCoverUrl) => {
    try {
      const res = await authFetch(`/api/votes/${clubId}`, {
        method: 'POST',
        body: JSON.stringify({ nomineeId, nomineeTitle, nomineeAuthor, nomineeCoverUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        get().fetchVotes(clubId);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  setCurrentClub: (club) => set({ currentClub: club }),

  fetchNotifications: async () => {
    try {
      const res = await authFetch('/api/notifications');
      const data = await res.json();
      if (res.ok) set({ notifications: data.notifications || [], unreadCount: data.unreadCount || 0 });
    } catch {
      // ignore
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      set((s) => ({
        notifications: s.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await authFetch('/api/notifications/read-all', { method: 'POST' });
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  addNotification: (notif) => {
    set((s) => ({
      notifications: [notif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },
}));
