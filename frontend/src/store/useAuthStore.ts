import { create } from 'zustand';

export type UserRole = 'admin' | 'receptionist' | 'barber' | 'customer';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  barber_id?: string | null;
  phone?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, pin: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  registerCustomer: (name: string, phone: string, pin: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  setUser: (user: AuthUser | null, token: string | null) => void;
}

const STORAGE_TOKEN_KEY = 'salon_auth_token_v1';
const STORAGE_USER_KEY = 'salon_auth_user_v1';

// Initial state from localStorage if present
let initialToken: string | null = null;
let initialUser: AuthUser | null = null;

if (typeof window !== 'undefined') {
  try {
    initialToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const userStr = localStorage.getItem(STORAGE_USER_KEY);
    if (userStr) {
      initialUser = JSON.parse(userStr);
    }
  } catch {
    // ignore storage read errors
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: !!initialToken && !!initialUser,

  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token && user) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
    set({ user, token, isAuthenticated: !!token && !!user });
  },

  login: async (username: string, pin: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    // Default mock fallback for offline or standalone client demo
    const mockCredentials: Record<string, { pin: string; user: AuthUser }> = {
      admin: {
        pin: '9999',
        user: { id: 'u-admin', username: 'admin', name: 'Salon Owner', role: 'admin' },
      },
      reception: {
        pin: '1234',
        user: { id: 'u-reception', username: 'reception', name: 'Front Desk Reception', role: 'receptionist' },
      },
      ravi: {
        pin: '1111',
        user: { id: 'u-ravi', username: 'ravi', name: 'Ravi (Senior Stylist)', role: 'barber', barber_id: 'b-ravi' },
      },
      amit: {
        pin: '2222',
        user: { id: 'u-amit', username: 'amit', name: 'Amit (Master Stylist)', role: 'barber', barber_id: 'b-amit' },
      },
      imran: {
        pin: '3333',
        user: { id: 'u-imran', username: 'imran', name: 'Imran (Hair Specialist)', role: 'barber', barber_id: 'b-imran' },
      },
      '9876543210': {
        pin: '1234',
        user: { id: 'u-kunal', username: '9876543210', name: 'Kunal Patel', role: 'customer', phone: '9876543210' },
      },
    };

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, pin: cleanPin }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = data.user;
        const token: string = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_TOKEN_KEY, token);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
        return { success: true, user };
      } else {
        const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
        return { success: false, error: err.detail || 'Invalid username or PIN' };
      }
    } catch {
      // Offline fallback: check mock accounts
      const matched = mockCredentials[cleanUser];
      if (matched && matched.pin === cleanPin) {
        const dummyToken = `mock-token-${matched.user.id}-${Date.now()}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_TOKEN_KEY, dummyToken);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(matched.user));
        }
        set({ user: matched.user, token: dummyToken, isAuthenticated: true });
        return { success: true, user: matched.user };
      }
      return { success: false, error: 'Invalid username, phone number, or PIN.' };
    }
  },

  registerCustomer: async (name: string, phone: string, pin: string) => {
    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanPin = pin.trim();

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE_URL}/api/auth/customer-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, phone: cleanPhone, pin: cleanPin }),
      });

      if (res.ok) {
        const data = await res.json();
        const user: AuthUser = data.user;
        const token: string = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_TOKEN_KEY, token);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
        return { success: true, user };
      } else {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        return { success: false, error: err.detail || 'Registration failed' };
      }
    } catch {
      // Offline fallback
      const newUser: AuthUser = {
        id: `u-${Date.now()}`,
        username: cleanPhone,
        name: cleanName,
        phone: cleanPhone,
        role: 'customer',
      };
      const dummyToken = `mock-token-${newUser.id}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_TOKEN_KEY, dummyToken);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
      }
      set({ user: newUser, token: dummyToken, isAuthenticated: true });
      return { success: true, user: newUser };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
