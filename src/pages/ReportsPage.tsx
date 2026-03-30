import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown, Loader2, FileText, Search, Building2, CheckCircle2, ShieldAlert, FileBarChart } from 'lucide-react';
import { getCompanies } from '@/lib/api/companies';
import { getAllScores } from '@/lib/api/scores';
import { triggerReport } from '@/lib/api/reports';
import type { Score } from '@/types';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatScore, formatDate } from '@/lib/utils';

export default function ReportsPage() {
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState<number | null>(null);

    const { data: companies = [], isLoading: isLoadingComps } = useQuery({ 
        queryKey: ['companies'], 
        queryFn: getCompanies 
    });
    
    const { data: scores = [], isLoading: isLoadingScores } = useQuery({
        queryKey: ['scores'],
        queryFn: getAllScores,
    });

    const isLoading = isLoadingComps || isLoadingScores;

    const latestScoresMap = useMemo(() => scores.reduce((acc, score) => {
        const existing = acc[score.companyId];
        if (!existing || new Date(score.scoredAt!) > new Date(existing.scoredAt!)) {
            acc[score.companyId] = score;
        }
        return acc;
    }, {} as Record<number, Score>), [scores]);

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        (c.taxId || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleDownload = async (companyId: number) => {
        setDownloading(companyId);
        try { 
            await triggerReport(companyId); 
        } finally { 
            setTimeout(() => setDownloading(null), 1500); 
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <FileBarChart className="text-brand-light" />
                        Centre de Rapports PDF
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Générez et téléchargez les impressions institutionnelles (Modèle CDC F-03) détaillant les évaluations de risques.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 border-l-2 border-brand-light relative overflow-hidden">
                    <Building2 size={80} className="absolute -bottom-4 -right-4 text-brand-light/10" />
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Entreprises Éligibles</p>
                    <p className="text-3xl font-bold text-white">{companies.length}</p>
                </div>
                <div className="glass-card p-5 border-l-2 border-risk-excellent relative overflow-hidden">
                    <CheckCircle2 size={80} className="absolute -bottom-4 -right-4 text-risk-excellent/10" />
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Scores Calculés</p>
                    <p className="text-3xl font-bold text-risk-excellent">{Object.keys(latestScoresMap).length}</p>
                </div>
                <div className="glass-card p-5 border-l-2 border-brand relative overflow-hidden flex flex-col justify-center">
                    <ShieldAlert size={80} className="absolute -bottom-4 -right-4 text-brand/10" />
                    <p className="text-sm text-gray-300 relative z-10 leading-relaxed max-w-[90%]">
                        Les rapports incluent l'analyse détaillée des 15 ratios financiers exigés par la CDC.
                    </p>
                </div>
            </div>

            {/* Main Area */}
            <div className="glass-card flex flex-col min-h-[500px]">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher une entreprise ou ICE..."
                            className="input-field pl-10 py-2.5 w-full bg-navy-900/50 border-white/10"
                        />
                    </div>
                </div>

                <div className="flex-1 bg-navy-900/20 p-4 sm:p-6">
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-gray-500">
                            <div className="animate-spin mb-4 w-8 h-8 border-2 border-brand-light border-t-transparent rounded-full" />
                            <p>Préparation de l'espace documentaire...</p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-brand-light/10 flex items-center justify-center mb-4">
                                <FileText size={32} className="text-brand-light" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Aucun dossier trouvé</h3>
                            <p className="text-gray-500 text-sm max-w-sm">Aucune entreprise ne correspond à votre recherche actuelle.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredCompanies.map(company => {
                                const score = latestScoresMap[company.id];
                                const isDownloading = downloading === company.id;

                                return (
                                    <div 
                                        key={company.id} 
                                        className="group bg-navy-800/40 border border-white/5 rounded-xl p-5 hover:border-brand-light/30 transition-all hover:bg-navy-800/60 overflow-hidden relative flex flex-col justify-between min-h-[160px]"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="mt-1 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-brand-light/10 group-hover:text-brand-light transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="min-w-0 flex flex-col">
                                                    <h3 className="text-white font-medium truncate text-base group-hover:text-brand-light transition-colors">
                                                        {company.name}
                                                    </h3>
                                                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                                                        ICE: {company.taxId || 'N/A'} • {company.industry || 'Secteur non défini'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
                                            <div className="bg-black/20 rounded-lg p-2.5 flex items-center gap-4 flex-wrap flex-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Dernier Score</span>
                                                    {score ? (
                                                        <span className="font-mono text-white text-sm">{formatScore(score.overallScore)}</span>
                                                    ) : (
                                                        <span className="text-gray-600 text-xs italic">N/A</span>
                                                    )}
                                                </div>
                                                <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Niveau de Risque</span>
                                                    {score ? (
                                                        <RiskBadge level={score.riskLevel} />
                                                    ) : (
                                                        <span className="text-gray-600 text-xs italic">—</span>
                                                    )}
                                                </div>
                                                <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Mise à jour</span>
                                                    <span className="text-gray-400 text-xs">{score ? formatDate(score.scoredAt) : '—'}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDownload(company.id)}
                                                disabled={isDownloading || !score}
                                                className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all focus:ring-2 focus:ring-brand-light focus:outline-none ${
                                                    isDownloading 
                                                        ? 'bg-brand/20 text-brand-light border border-brand/30' 
                                                        : !score
                                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-transparent'
                                                            : 'bg-brand text-white hover:bg-brand-light hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {isDownloading ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Création...</>
                                                ) : (
                                                    <><FileDown size={16} /> Rapport PDF</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
