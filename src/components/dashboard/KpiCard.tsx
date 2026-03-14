import type { LucideIcon } from 'lucide-react';

interface Props {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: string;
}

export default function KpiCard({ label, value, icon: Icon, trend, trendUp, color = '#1E50A0' }: Props) {
    return (
        <div className="glass-card p-5 flex items-start gap-4 hover:border-white/20 transition-all duration-200">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}22` }}>
                <Icon size={20} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
                {trend && (
                    <p className={`text-xs mt-1 ${trendUp ? 'text-risk-low' : 'text-risk-high'}`}>
                        {trendUp ? '▲' : '▼'} {trend}
                    </p>
                )}
            </div>
        </div>
    );
}
