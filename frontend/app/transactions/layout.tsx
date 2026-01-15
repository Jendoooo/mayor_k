import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function TransactionsLayout({
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
