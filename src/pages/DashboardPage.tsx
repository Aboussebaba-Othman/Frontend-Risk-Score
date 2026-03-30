import { useQuery } from '@tanstack/react-query';
import { Building2, AlertTriangle, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCompanies } from '@/lib/api/companies';
import { getAlerts } from '@/lib/api/alerts';
import { getAllScores } from '@/lib/api/scores';
import type { Score } from '@/types';
import KpiCard from '@/components/dashboard/KpiCard';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import ScoreBySectorChart from '@/components/dashboard/ScoreBySectorChart';
import ExposureTables from '@/components/dashboard/ExposureTables';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatDate, getAlertRiskLevel } from '@/lib/utils';

export default function DashboardPage() {
    const { data: companies = [] } = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
    const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });
    const { data: scores = [] } = useQuery({ queryKey: ['scores'], queryFn: getAllScores });

    // ── Compute latest score per company ──────────────────────────────────
    const latestScoresMap = scores.reduce((acc, score) => {
        const existing = acc[score.companyId];
        if (!existing || new Date(score.scoredAt!) > new Date(existing.scoredAt!)) {
            acc[score.companyId] = score;
        }
        return acc;
    }, {} as Record<number, Score>);

    const latestScores = Object.values(latestScoresMap);
    const scoredCount = latestScores.length;
    const avgScore = scoredCount
        ? latestScores.reduce((s, sc) => s + (sc.overallScore ?? 0), 0) / scoredCount
        : 0;

    // ── Risk Heatmap: matrix[sector][riskLevel] = count ───────────────────
    const heatmapMatrix: Record<string, Record<string, number>> = {};
    const heatmapSectors: Set<string> = new Set();

    companies.forEach(c => {
        const sc = latestScoresMap[c.id];
        if (sc?.riskLevel && c.industry) {
            heatmapSectors.add(c.industry);
            if (!heatmapMatrix[c.industry]) heatmapMatrix[c.industry] = {};
            heatmapMatrix[c.industry][sc.riskLevel] = (heatmapMatrix[c.industry][sc.riskLevel] ?? 0) + 1;
        }
    });

    const sectors = Array.from(heatmapSectors).sort();

    // ── Sector averages for bar chart ──────────────────────────────────────
    const sectorStats = companies.reduce((acc, c) => {
        const score = latestScoresMap[c.id]?.overallScore;
        if (score != null && c.industry) {
            if (!acc[c.industry]) acc[c.industry] = { sum: 0, count: 0 };
            acc[c.industry].sum += score;
            acc[c.industry].count += 1;
        }
        return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const sectorAverages = Object.entries(sectorStats)
        .map(([sector, d]) => ({ sector, avgScore: d.sum / d.count }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 8);

    // ── Exposure tables ───────────────────────────────────────────────────
    const GOOD_LEVELS = new Set(['EXCELLENT', 'LOW_RISK']);
    const BAD_LEVELS  = new Set(['HIGH_RISK', 'CRITICAL']);

    const allExposureEntries = companies
        .map(c => {
            const sc = latestScoresMap[c.id];
            if (!sc || !sc.riskLevel) return null;
            return { 
                companyId: c.id, 
                companyName: c.name, 
                industry: c.industry || '—', 
                score: sc.overallScore ?? 0, 
                riskLevel: sc.riskLevel 
            };
        })
        .filter((e): e is NonNullable<typeof e> => Boolean(e));

    const topPerformers = allExposureEntries
        .filter(e => GOOD_LEVELS.has(e.riskLevel))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    const criticalExposures = allExposureEntries
        .filter(e => BAD_LEVELS.has(e.riskLevel))
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);

    return (
        <div className="space-y-4 animate-fade-in">

            {/* ── KPI Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard
                    label="Entreprises"
                    value={companies.length}
                    icon={Building2}
                    color="#1E50A0"
                />
                <KpiCard
                    label="Score Moyen"
                    value={scoredCount ? `${Math.round(avgScore)}/100` : '—'}
                    icon={Activity}
                    color="#3d8c6a"
                    trend={scoredCount ? `${scoredCount} scorées` : undefined}
                    trendUp={true}
                />
                <KpiCard
                    label="Alertes Actives"
                    value={alerts.length}
                    icon={AlertTriangle}
                    color="#a83c3c"
                    trend={alerts.length > 0 ? `${alerts.length} en attente` : undefined}
                    trendUp={false}
                />
                <KpiCard
                    label="Rapports Disponibles"
                    value={scoredCount}
                    icon={FileText}
                    color="#c49a2e"
                />
            </div>

            {/* ── Risk Heatmap + Sector Chart ───────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="glass-card p-4 xl:col-span-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white text-sm font-semibold">Matrice d'Exposition — Secteur × Risque</h2>
                        <span className="section-label">{sectors.length} secteurs</span>
                    </div>
                    <RiskHeatmap matrix={heatmapMatrix} sectors={sectors} />
                </div>

                <div className="glass-card p-4 xl:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white text-sm font-semibold">Score Moyen par Secteur</h2>
                        <span className="section-label">{sectorAverages.length} secteurs</span>
                    </div>
                    <ScoreBySectorChart data={sectorAverages} />
                </div>
            </div>

            <ExposureTables top={topPerformers} critical={criticalExposures} />

            {alerts.length > 0 && (
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle size={14} className="text-risk-high" />
                            Alertes récentes
                        </h2>
                        <Link to="/alerts" className="text-brand-light text-xs hover:underline">
                            Tout voir →
                        </Link>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {alerts.slice(0, 4).map(a => (
                            <div key={a.id} className="flex items-center gap-3 py-2.5 hover:bg-white/[0.02] transition-colors rounded px-1">
                                <AlertTriangle size={12} className="text-risk-high flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{a.subject || a.title}</p>
                                    <p className="text-corp-muted text-2xs">{formatDate(a.createdAt)}</p>
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
