'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 'var(--space-lg)',
    }}>
      <div className="spinner" style={{ width: 40, height: 40 }}></div>
      <p style={{ color: 'var(--color-text-secondary)' }}>Loading Mayor K. Guest Palace...</p>
    </div>
  );
}
