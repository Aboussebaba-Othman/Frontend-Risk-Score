import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calculator, FileDown, Plus, Loader2, BrainCircuit, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { getCompany, deleteCompany } from '@/lib/api/companies';
import { getLatestScore, getScoreHistory, getRecommendation, calculateScore } from '@/lib/api/scores';
import { triggerReport } from '@/lib/api/reports';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatDate, getRiskColor } from '@/lib/utils';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { triggerAnalysis, getLatestAnalysis } from '@/lib/api/analysis';
import SwotMatrix from '@/components/company/SwotMatrix';
import ScoreGauge from '@/components/company/ScoreGauge';
import ScoreRadar from '@/components/company/ScoreRadar';
import RecommendationCard from '@/components/company/RecommendationCard';

export default function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const companyId = Number(id);
    const qc = useQueryClient();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedScore, setSelectedScore] = useState<any>(null);

    const { data: company } = useQuery({ queryKey: ['company', companyId], queryFn: () => getCompany(companyId) });
    const { data: score } = useQuery({ queryKey: ['score', companyId], queryFn: () => getLatestScore(companyId), retry: false });
    const { data: history = [] } = useQuery({ queryKey: ['history', companyId], queryFn: () => getScoreHistory(companyId), retry: false });
    const { data: rec } = useQuery({ queryKey: ['rec', companyId], queryFn: () => getRecommendation(companyId), retry: false });
    const { data: analysis, isLoading: isLoadingAnalysis } = useQuery({ queryKey: ['analysis', companyId], queryFn: () => getLatestAnalysis(companyId), retry: false });

    const scoreMutation = useMutation({
        mutationFn: () => calculateScore(companyId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['score', companyId] });
            qc.invalidateQueries({ queryKey: ['history', companyId] });
            qc.invalidateQueries({ queryKey: ['rec', companyId] });
        },
    });

    const analysisMutation = useMutation({
        mutationFn: () => triggerAnalysis(companyId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['analysis', companyId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteCompany(companyId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['companies'] });
            navigate('/companies');
        },
    });

    const handleDelete = () => {
        if (window.confirm('Voulez-vous vraiment supprimer cette entreprise ? Cette action est irréversible.')) {
            deleteMutation.mutate();
        }
    };

    if (!company) return <div className="text-gray-500 animate-pulse p-8">Chargement...</div>;

    const activeScore = selectedScore || score;

    const overallScore = activeScore?.overallScore ?? 0;
    const riskColor = getRiskColor(activeScore?.riskLevel);

    const historyData = history.slice().reverse().map((s, i) => ({
        name: `S${i + 1}`,
        score: s.overallScore,
        date: formatDate(s.scoredAt),
        raw: s
    }));

    return (
        <div className="space-y-5 animate-fade-in relative">
            <div className="flex items-center justify-between">
                <Link to="/companies" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft size={15} /> Retour
                </Link>
                <div className="flex gap-2">
                    <Link to={`/companies/${companyId}/financials`}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 text-gray-300 hover:text-white transition-all">
                        <Plus size={13} /> Données financières
                    </Link>
                    <Link
                        to={`/companies/${companyId}/edit`}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-brand/30 hover:border-brand/60 text-brand-light hover:text-white transition-all">
                        <Pencil size={13} /> Modifier
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all font-semibold"
                    >
                        {deleteMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Supprimer
                    </button>
                    <button
                        onClick={() => analysisMutation.mutate()}
                        disabled={analysisMutation.isPending}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all font-semibold"
                    >
                        {analysisMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <BrainCircuit size={13} />}
                        Générer SWOT
                    </button>
                    <button
                        onClick={() => scoreMutation.mutate()}
                        disabled={scoreMutation.isPending}
                        className="btn-primary flex items-center gap-1.5 text-xs py-2"
                    >
                        {scoreMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Calculator size={13} />}
                        Calculer le score
                    </button>
                    <button
                        onClick={() => triggerReport(companyId)}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                    >
                        <FileDown size={13} /> PDF
                    </button>
                </div>
            </div>

            {selectedScore && (
                <div className="bg-brand/10 border border-brand/20 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center animate-fade-in shadow-[0_0_15px_rgba(30,80,160,0.15)]">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-light opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand text-white"></span>
                        </span>
                        <div>
                            <span className="text-brand-light font-semibold text-sm">Mode Historique Actif</span>
                            <span className="text-gray-400 text-xs ml-3 hidden sm:inline-block">Vous visualisez les données calculées le {formatDate(selectedScore.scoredAt)}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedScore(null)}
                        className="text-xs font-bold uppercase tracking-wider bg-brand/20 text-white px-4 py-1.5 rounded hover:bg-brand/40 transition-colors mt-2 sm:mt-0"
                    >
                        Fermer l'historique ✕
                    </button>
                </div>
            )}

            <div className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{company.name}</h2>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                            {company.taxId && <span>ICE: <span className="text-gray-300">{company.taxId}</span></span>}
                            {company.industry && <span>Secteur: <span className="text-gray-300">{company.industry}</span></span>}
                            {company.country && <span>Pays: <span className="text-gray-300">{company.country}</span></span>}
                            {company.incorporationDate && <span>Création: <span className="text-gray-300">{formatDate(company.incorporationDate)}</span></span>}
                        </div>
                    </div>
                    {score && <RiskBadge level={score.riskLevel} className="text-sm px-3 py-1" />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className={`glass-card p-5 flex flex-col relative transition-all duration-300 ${selectedScore ? 'border-brand/30 bg-brand/5' : ''}`}>
                    <ScoreGauge score={activeScore} overallScore={overallScore} riskColor={riskColor} />
                </div>

                <div className={`glass-card p-5 transition-all duration-300 ${selectedScore ? 'border-brand/30 bg-brand/5' : ''}`}>
                    <ScoreRadar score={activeScore} riskColor={riskColor} />
                </div>

                <div className={`glass-card p-5 relative transition-all duration-300 ${selectedScore ? 'border-brand/30 bg-brand/5' : ''}`}>
                    <RecommendationCard rec={rec} />
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-white font-semibold mb-4 bg-white/5 border border-white/10 px-4 py-2 rounded-lg inline-block text-sm">Matrice S.W.O.T (Analyse d'impacts globaux)</h3>
                <SwotMatrix results={analysis?.results || []} isLoading={isLoadingAnalysis} />
            </div>

            {historyData.length > 1 && (
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Historique des scores</h3>
                        <p className="text-gray-500 text-xs">Cliquez sur un point pour voir ses détails dans les cartes au-dessus</p>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart 
                            data={historyData} 
                            style={{ cursor: 'pointer' }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onClick={(e: any) => {
                                if (!e) return;
                                let rawData = null;
                                if (e.activePayload?.[0]?.payload?.raw) {
                                    rawData = e.activePayload[0].payload.raw;
                                } else if (e.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null && historyData[e.activeTooltipIndex]) {
                                    rawData = historyData[e.activeTooltipIndex].raw;
                                }
                                
                                if (rawData) {
                                    setSelectedScore(rawData);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                labelStyle={{ color: '#9ca3af' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#1E50A0" 
                                strokeWidth={2.5}
                                className="cursor-pointer"
                                dot={{ fill: '#1E50A0', r: 4, pointerEvents: 'none' }} 
                                activeDot={{ r: 7, fill: '#2563eb', stroke: '#fff', strokeWidth: 2, pointerEvents: 'none' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeScore?.notes && (
                <div className="glass-card p-4 text-sm text-gray-400 border-l-2 border-brand/50">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                        Notes {selectedScore && `(du ${formatDate(selectedScore.scoredAt)})`}
                    </span>
                    <p className="mt-1">{activeScore.notes}</p>
                </div>
            )}
        </div>
    );
}
