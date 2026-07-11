import { create } from 'zustand';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const getLastSeen = () => localStorage.getItem('adminNotifSeenAt') || null;
const setLastSeen = (date) => localStorage.setItem('adminNotifSeenAt', date);

const useNotificationStore = create((set, get) => ({
  counts: { unreadMessages: 0, newOrders: 0, totalUnread: 0, totalOrders: 0, totalProducts: 0 },
  recentOrders: [],
  recentMessages: [],
  loading: false,

  fetchNotifications: async (token) => {
    if (!token) return;
    try {
      const since = getLastSeen();
      const params = since ? `?since=${since}` : '';
      const { data } = await axios.get(`${API}/notifications${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        counts: data.counts,
        recentOrders: data.recentOrders,
        recentMessages: data.recentMessages,
        loading: false,
      });
    } catch (error) {
      console.error('Notifications fetch error:', error);
    }
  },

  markSeen: async (token) => {
    if (!token) return;
    try {
      await axios.put(`${API}/contact/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLastSeen(new Date().toISOString());
      get().fetchNotifications(token);
    } catch (error) {
      console.error('Mark seen error:', error);
    }
  },
}));

export default useNotificationStore;
