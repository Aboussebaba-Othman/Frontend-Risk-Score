import { useQuery } from '@tanstack/react-query';
import { Building2, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { getCompanies } from '@/lib/api/companies';
import { getAlerts } from '@/lib/api/alerts';
import { getAllScores } from '@/lib/api/scores';
import KpiCard from '@/components/dashboard/KpiCard';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatDate, getAlertRiskLevel } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
    const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
    const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });
    const { data: scores = [] } = useQuery({ queryKey: ['scores'], queryFn: getAllScores });

    const latestScoresMap = scores.reduce((acc, score) => {
        const existing = acc[score.companyId];
        if (!existing || new Date(score.scoredAt!) > new Date(existing.scoredAt!)) {
            acc[score.companyId] = score;
        }
        return acc;
    }, {} as Record<number, any>);

    const latestScores = Object.values(latestScoresMap);
    const scoredCompaniesCount = latestScores.length;

    const riskCounts = latestScores.reduce((acc, score) => {
        if (score.riskLevel) {
            acc[score.riskLevel] = (acc[score.riskLevel] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const riskDist = [
        { name: 'Excellent', level: 'EXCELLENT', value: riskCounts['EXCELLENT'] || 0 },
        { name: 'Faible', level: 'LOW_RISK', value: riskCounts['LOW_RISK'] || 0 },
        { name: 'Modéré', level: 'MODERATE_RISK', value: riskCounts['MODERATE_RISK'] || 0 },
        { name: 'Moyen', level: 'MEDIUM_RISK', value: riskCounts['MEDIUM_RISK'] || 0 },
        { name: 'Élevé', level: 'HIGH_RISK', value: riskCounts['HIGH_RISK'] || 0 },
        { name: 'Critique', level: 'CRITICAL', value: riskCounts['CRITICAL'] || 0 },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard label="Entreprises" value={companies.length} icon={Building2} color="#1E50A0" />
                <KpiCard label="Alertes actives" value={alerts.length} icon={AlertTriangle} color="#E74C3C"
                    trend={alerts.length > 0 ? `${alerts.length} en attente` : undefined} trendUp={false} />
                <KpiCard label="Scores calculés" value={scoredCompaniesCount} icon={TrendingUp} color="#00A36C" />
                <KpiCard label="Rapports" value={0} icon={FileText} color="#F39C12" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="glass-card p-5">
                    <h2 className="text-white font-semibold mb-4">Distribution des risques</h2>
                    {riskDist.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">Calculez des scores pour voir la distribution.</p>
                        </div>
                    ) : (
                        <RiskDistributionChart data={riskDist} />
                    )}
                </div>

                <div className="glass-card p-5 xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold">Dernières entreprises</h2>
                        <Link to="/companies" className="text-brand-light text-sm hover:underline">Voir tout →</Link>
                    </div>
                    {companies.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">Aucune entreprise enregistrée.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {['Nom', 'Secteur', 'Risque', 'Statut', ''].map(h => (
                                        <th key={h} className="text-gray-400 text-xs font-medium text-left pb-3 pr-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {companies.slice(0, 6).map(c => {
                                    const cScore = latestScoresMap[c.id];
                                    return (
                                        <tr key={c.id} className="hover:bg-white/2 transition-colors">
                                            <td className="py-3 pr-4 font-medium text-white">{c.name}</td>
                                            <td className="py-3 pr-4 text-gray-400">{c.industry ?? '—'}</td>
                                            <td className="py-3 pr-4">
                                                {cScore ? <RiskBadge level={cScore.riskLevel} /> : <span className="text-xs text-gray-500">—</span>}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                                    {c.status ?? 'Actif'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <Link to={`/companies/${c.id}`} className="text-brand-light text-xs hover:underline">
                                                    Voir →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {alerts.length > 0 && (
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <AlertTriangle size={16} className="text-risk-high" />
                            Alertes récentes
                        </h2>
                        <Link to="/alerts" className="text-brand-light text-sm hover:underline">Tout voir →</Link>
                    </div>
                    <div className="space-y-2">
                        {alerts.slice(0, 3).map(a => (
                            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <AlertTriangle size={14} className="text-risk-high flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{a.subject || a.title}</p>
                                    <p className="text-gray-500 text-xs">{formatDate(a.createdAt)}</p>
                                </div>
                                <RiskBadge level={a.riskLevel || getAlertRiskLevel(a.severity)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
