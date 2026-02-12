import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F5F7FA] p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
