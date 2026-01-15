'use client';

import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function BarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedLayout>{children}</ProtectedLayout>;
}
