import { create } from 'zustand';

// localStorage 직접 사용 (persist 미들웨어 없이)
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    return stored ? JSON.parse(stored) : { user: null, isAuthenticated: false, isGuest: false };
  } catch {
    return { user: null, isAuthenticated: false, isGuest: false };
  }
};

export const useAuthStore = create((set) => ({
  ...getStoredAuth(),
  
  setUser: (user) => {
    const state = { user, isAuthenticated: !!user };
    localStorage.setItem('auth-storage', JSON.stringify(state));
    set(state);
  },
  
  setGuest: (isGuest) => {
    const state = { isGuest };
    localStorage.setItem('auth-storage', JSON.stringify({ ...getStoredAuth(), ...state }));
    set(state);
  },
  
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ user: null, isAuthenticated: false, isGuest: false });
  },
}));
