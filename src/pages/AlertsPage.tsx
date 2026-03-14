import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getAlerts } from '@/lib/api/alerts';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatDate, getAlertRiskLevel } from '@/lib/utils';

export default function AlertsPage() {
    const { data: alerts = [], isLoading } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });

    const processedAlerts = alerts.map(a => ({
        ...a,
        riskLevel: a.riskLevel || getAlertRiskLevel(a.severity),
        subject: a.subject || a.title
    }));

    const critical = processedAlerts.filter(a => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH_RISK');
    const others = processedAlerts.filter(a => a.riskLevel !== 'CRITICAL' && a.riskLevel !== 'HIGH_RISK');

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total alertes', value: alerts.length, color: 'text-white' },
                    { label: 'Critiques / Élevées', value: critical.length, color: 'text-risk-high' },
                    { label: 'Autres', value: others.length, color: 'text-risk-moderate' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="glass-card px-5 py-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-risk-high" />
                    <h2 className="text-white font-semibold">Toutes les alertes</h2>
                </div>

                {isLoading ? (
                    <div className="py-10 text-center text-gray-500">Chargement...</div>
                ) : processedAlerts.length === 0 ? (
                    <div className="py-12 text-center">
                        <CheckCircle size={40} className="text-risk-low mx-auto mb-3" />
                        <p className="text-gray-300 font-medium">Aucune alerte active</p>
                        <p className="text-gray-500 text-sm mt-1">Tous les risques sont sous contrôle.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {processedAlerts.map(alert => {
                            const isCrit = alert.riskLevel === 'CRITICAL' || alert.riskLevel === 'HIGH_RISK';
                            return (
                                <div key={alert.id}
                                    className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/2 ${isCrit ? 'border-l-2 border-risk-high' : ''}`}>
                                    <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${isCrit ? 'text-risk-high' : 'text-risk-moderate'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm">{alert.subject}</p>
                                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{alert.message}</p>
                                        <p className="text-gray-600 text-xs mt-1.5">{formatDate(alert.createdAt)}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <RiskBadge level={alert.riskLevel} />
                                        {alert.score != null && (
                                            <span className="text-gray-500 text-xs">{alert.score}/100</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
