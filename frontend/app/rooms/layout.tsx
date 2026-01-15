import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function RoomsLayout({
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
