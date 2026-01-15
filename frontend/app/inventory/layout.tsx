'use client';

import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function InventoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedLayout>{children}</ProtectedLayout>;
}
