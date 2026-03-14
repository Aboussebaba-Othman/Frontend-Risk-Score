import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    setToken: (token: string) => void;
    setUser: (user: AuthUser) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null }),
            isAuthenticated: () => !!get().token,
        }),
        { name: 'auth-storage' }
    )
);
