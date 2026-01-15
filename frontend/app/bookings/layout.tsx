import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function BookingsLayout({
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
