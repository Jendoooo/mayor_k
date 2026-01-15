'use client';

import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function AuditLogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedLayout>{children}</ProtectedLayout>;
}
