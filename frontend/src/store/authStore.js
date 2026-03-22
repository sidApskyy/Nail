import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  currentStaffProfile: null,
  accessToken: null,
  initializing: true,

  setAccessToken: (token) => set({ accessToken: token }),

  setCurrentStaffProfile: (staffProfile) => set({ currentStaffProfile: staffProfile }),

  getEffectiveUser: () => {
    const { user, currentStaffProfile } = get();
    return currentStaffProfile || user;
  },

  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const user = res.data?.data?.user;
    const accessToken = res.data?.data?.accessToken;

    set({ user, accessToken });
    return user;
  },

  hydrate: async () => {
    try {
      const res = await api.post('/auth/refresh-token');
      const accessToken = res.data?.data?.accessToken;
      const user = res.data?.data?.user;
      if (accessToken) {
        set({ accessToken, user: user || null });
      }
    } catch (e) {
      // This is expected behavior when refresh token expires
      // User will need to log in again
      set({ user: null, accessToken: null, initializing: false });
    } finally {
      set({ initializing: false });
    }
  },

  setUser: (user) => set({ user }),

  logout: () => set({ user: null, currentStaffProfile: null, accessToken: null })
}));
