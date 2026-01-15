import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function ExpensesLayout({
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
