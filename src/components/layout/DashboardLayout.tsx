import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
