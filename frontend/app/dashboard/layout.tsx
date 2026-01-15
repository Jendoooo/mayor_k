import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout>
            {children}
        </ProtectedLayout>
    );
}
