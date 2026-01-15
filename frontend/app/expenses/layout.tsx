import Sidebar from '@/app/components/Sidebar';

export default function ExpensesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
