import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '@/lib/api/alerts';
import NotificationDropdown from './NotificationDropdown';
import { useAlertStream } from '@/lib/useAlertStream';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/companies': 'Entreprises',
    '/alerts': 'Centre d\'alertes',
    '/reports': 'Rapports PDF',
};

export default function Topbar() {
    const { pathname } = useLocation();
    const base = '/' + pathname.split('/')[1];
    const title = PAGE_TITLES[base] ?? 'Risk Assessment';

    useAlertStream();

    const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });

    return (
        <header className="h-16 bg-navy-800/50 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4">
            <h1 className="text-lg font-semibold text-white flex-1">{title}</h1>

            <div className="relative hidden md:flex items-center">
                <Search size={15} className="absolute left-3 text-gray-500" />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="input-field pl-9 pr-4 py-1.5 text-sm w-56"
                />
            </div>

            <NotificationDropdown alerts={alerts} />
        </header>
    );
}
