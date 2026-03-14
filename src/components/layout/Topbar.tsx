import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
    '/': 'Tableau de bord',
    '/companies': 'Entreprises',
    '/alerts': 'Centre d\'alertes',
    '/reports': 'Rapports PDF',
};

export default function Topbar() {
    const { pathname } = useLocation();
    const base = '/' + pathname.split('/')[1];
    const title = PAGE_TITLES[base] ?? 'Risk Assessment';

    return (
        <header className="h-16 bg-navy-800/50 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4">
            <h1 className="text-lg font-semibold text-white flex-1">{title}</h1>

            {/* Search */}
            <div className="relative hidden md:flex items-center">
                <Search size={15} className="absolute left-3 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="input-field pl-9 pr-4 py-1.5 text-sm w-56"
                />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-risk-high rounded-full" />
            </button>
        </header>
    );
}
