import ProtectedLayout from '@/app/components/ProtectedLayout';

export default function GuestsLayout({
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
