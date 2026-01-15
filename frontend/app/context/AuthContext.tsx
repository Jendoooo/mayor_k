'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api, { User } from '@/app/lib/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.log('Not authenticated');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (userData: User) => {
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            await api.logout();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
            // Force local logout even if API fails
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
