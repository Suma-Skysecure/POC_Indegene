import UserSidebar from '@/components/UserSidebar';
import UserHeader from '@/components/UserHeader';

export default function UserLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#F5F7FA]">
            {/* Header - Fixed at Top */}
            <UserHeader />

            {/* Sidebar - Fixed at Left, Below Header */}
            <UserSidebar />

            {/* Main Content - Pushed Right and Down */}
            <div className="pt-16 pl-64">
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
