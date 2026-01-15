'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await api.login(username, password);
            if (user) {
                login(user);
                router.push('/dashboard');
            } else {
                setError('Invalid username or password');
            }
        } catch (err: any) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-xl)' }}>
                <div className="text-center mb-xl">
                    <div className="flex justify-center mb-md">
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '24px',
                            color: 'white',
                        }}>
                            MK
                        </div>
                    </div>
                    <h1 className="mb-sm">Staff Login</h1>
                    <p className="text-secondary">Mayor K. Guest Palace System</p>
                </div>

                {error && (
                    <div className="badge badge-rejected w-full mb-md text-center p-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="text-center mt-lg">
                    <Link href="/" className="text-sm text-secondary hover:text-white">
                        ← Back to Public Site
                    </Link>
                </div>
            </div>
        </div>
    );
}
