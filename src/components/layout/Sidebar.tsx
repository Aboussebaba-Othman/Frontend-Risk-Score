import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Building2, Bell, FileText, LogOut, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/companies', label: 'Entreprises', icon: Building2 },
    { to: '/alerts', label: 'Alertes', icon: Bell },
    { to: '/reports', label: 'Rapports', icon: FileText },
];

export default function Sidebar() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside className="w-64 min-h-screen bg-navy-800/80 backdrop-blur border-r border-white/5 flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                        <Shield size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-none">RiskAssess</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">CDC Platform</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            cn('sidebar-item', isActive && 'active')
                        }
                    >
                        <Icon size={17} />
                        <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-3 py-4 border-t border-white/5">
                <div className="px-3 py-2 mb-2">
                    <p className="text-white text-sm font-medium truncate">{user?.username ?? 'Utilisateur'}</p>
                    <p className="text-gray-500 text-xs">Administrateur</p>
                </div>
                <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <LogOut size={17} />
                    <span className="text-sm font-medium">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}
