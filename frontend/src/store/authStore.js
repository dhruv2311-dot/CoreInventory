import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: (userData, token) => {
    localStorage.setItem('token', token);
    // Derived role logically. Temporary check for email containing 'dhruv' to ensure the creator has Admin privileges natively.
    const isManager = userData.role === 'Inventory Manager' || userData.email?.includes('dhruv');
    const enrichedUser = { ...userData, role: isManager ? 'Inventory Manager' : 'Warehouse Staff' };
    
    set({ user: enrichedUser, isAuthenticated: true, isAdmin: isManager });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
  setUser: (userData) => {
    const isManager = userData.role === 'Inventory Manager' || userData.email?.includes('dhruv');
    const enrichedUser = { ...userData, role: isManager ? 'Inventory Manager' : 'Warehouse Staff' };
    set({ user: enrichedUser, isAuthenticated: true, isAdmin: isManager });
  },
}));
