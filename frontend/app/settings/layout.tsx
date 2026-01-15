import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function SettingsLayout({
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
