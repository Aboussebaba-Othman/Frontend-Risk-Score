import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calculator, FileDown, Plus, Loader2 } from 'lucide-react';
import { getCompany } from '@/lib/api/companies';
import { getLatestScore, getScoreHistory, getRecommendation, calculateScore } from '@/lib/api/scores';
import { triggerReport } from '@/lib/api/reports';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatDate, getRiskColor, getRiskLabel } from '@/lib/utils';
import {
    RadialBarChart, RadialBar, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

export default function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const companyId = Number(id);
    const qc = useQueryClient();

    const { data: company } = useQuery({ queryKey: ['company', companyId], queryFn: () => getCompany(companyId) });
    const { data: score } = useQuery({ queryKey: ['score', companyId], queryFn: () => getLatestScore(companyId), retry: false });
    const { data: history = [] } = useQuery({ queryKey: ['history', companyId], queryFn: () => getScoreHistory(companyId), retry: false });
    const { data: rec } = useQuery({ queryKey: ['rec', companyId], queryFn: () => getRecommendation(companyId), retry: false });

    const scoreMutation = useMutation({
        mutationFn: () => calculateScore(companyId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['score', companyId] });
            qc.invalidateQueries({ queryKey: ['history', companyId] });
            qc.invalidateQueries({ queryKey: ['rec', companyId] });
        },
    });

    if (!company) return <div className="text-gray-500 animate-pulse p-8">Chargement...</div>;

    const overallScore = score?.overallScore ?? 0;
    const riskColor = getRiskColor(score?.riskLevel);

    const gaugeData = [{ name: 'Score', value: overallScore, fill: riskColor }];

    const radarData = [
        { subject: 'Financier (40%)', value: score?.financialScore ?? 0 },
        { subject: 'Paiement (35%)', value: score?.operationalScore ?? 0 },
        { subject: 'Contexte (25%)', value: score?.marketScore ?? 0 },
    ];

    const historyData = history.slice().reverse().map((s, i) => ({
        name: `S${i + 1}`,
        score: s.overallScore,
        date: formatDate(s.scoredAt),
    }));

    const isAccord = rec?.decision?.startsWith('ACCORD');
    const isRefus = rec?.decision === 'REFUS';
    const decColor = isAccord ? '#2ECC71' : isRefus ? '#E74C3C' : '#F39C12';

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
                <Link to="/companies" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
                    <ArrowLeft size={15} /> Retour
                </Link>
                <div className="flex gap-2">
                    <Link to={`/companies/${companyId}/financials`}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 text-gray-300 hover:text-white transition-all">
                        <Plus size={13} /> Données financières
                    </Link>
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
                <div className="glass-card p-5 flex flex-col items-center">
                    <h3 className="text-white font-semibold mb-1">Score Global</h3>
                    <p className="text-gray-500 text-xs mb-4">CDC — 15 ratios</p>
                    {score ? (
                        <>
                            <div className="relative w-44 h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%"
                                        startAngle={225} endAngle={-45} data={gaugeData}>
                                        <RadialBar background={{ fill: '#1a2640' }} dataKey="value" cornerRadius={8} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold" style={{ color: riskColor }}>{Math.round(overallScore)}</span>
                                    <span className="text-gray-400 text-xs">/100</span>
                                </div>
                            </div>
                            <div className="mt-4 text-center space-y-1.5 w-full">
                                <p className="text-sm font-semibold" style={{ color: riskColor }}>{getRiskLabel(score.riskLevel)}</p>
                                <p className="text-gray-500 text-xs">Rating: {score.riskRating ?? '—'}</p>
                                {score.confidenceLevel != null && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Confiance</span><span>{score.confidenceLevel}%</span>
                                        </div>
                                        <div className="h-1.5 bg-navy-700 rounded-full">
                                            <div className="h-full bg-brand rounded-full transition-all"
                                                style={{ width: `${score.confidenceLevel}%` }} />
                                        </div>
                                    </div>
                                )}
                                {score.validUntil && (
                                    <p className="text-gray-500 text-xs">Valide jusqu'au {formatDate(score.validUntil)}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 text-sm">Aucun score calculé.</p>
                            <button onClick={() => scoreMutation.mutate()} className="btn-primary mt-3 text-xs">
                                Calculer maintenant
                            </button>
                        </div>
                    )}
                </div>

                <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-1">Sous-scores CDC</h3>
                    <p className="text-gray-500 text-xs mb-2">Décomposition par catégorie</p>
                    {score ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <RadarChart data={radarData} cx="50%" cy="50%">
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 text-sm py-8 text-center">Calculez le score pour voir le radar.</p>}
                    {score && (
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                            {[
                                { label: 'Financier', value: score.financialScore, w: '40%' },
                                { label: 'Paiement', value: score.operationalScore, w: '35%' },
                                { label: 'Contexte', value: score.marketScore, w: '25%' },
                            ].map(({ label, value, w }) => (
                                <div key={label} className="bg-navy-700/50 rounded-lg p-2">
                                    <p className="text-white text-lg font-bold">{value ?? '—'}</p>
                                    <p className="text-gray-500 text-[10px]">{label}</p>
                                    <p className="text-brand-light text-[9px]">{w}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-1">Recommandation CDC</h3>
                    <p className="text-gray-500 text-xs mb-4">F-03 Décision de crédit</p>
                    {rec ? (
                        <>
                            <div className="text-center rounded-xl py-3 mb-4 border"
                                style={{ backgroundColor: `${decColor}15`, borderColor: `${decColor}30` }}>
                                <p className="text-xl font-bold" style={{ color: decColor }}>{rec.decision}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{rec.decisionLabel}</p>
                            </div>
                            <dl className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Plafond crédit</dt>
                                    <dd className="text-white font-medium text-right max-w-[55%] text-xs">{rec.creditLimitPolicy}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Délai paiement</dt>
                                    <dd className="text-white font-medium">{rec.maxPaymentDays} jours</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Garanties</dt>
                                    <dd className="text-white font-medium text-right max-w-[55%] text-xs">{rec.guaranteesRequired}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Taux défaut</dt>
                                    <dd className="text-white font-medium">{rec.defaultRateRange}</dd>
                                </div>
                            </dl>
                        </>
                    ) : (
                        <p className="text-gray-500 text-sm py-8 text-center">Calculez le score pour voir la recommandation.</p>
                    )}
                </div>
            </div>

            {historyData.length > 1 && (
                <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-4">Historique des scores</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={historyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#141e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                labelStyle={{ color: '#9ca3af' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="score" stroke="#1E50A0" strokeWidth={2.5}
                                dot={{ fill: '#1E50A0', r: 4 }} activeDot={{ r: 6, fill: '#2563eb' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {score?.notes && (
                <div className="glass-card p-4 text-sm text-gray-400 border-l-2 border-brand/50">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Notes CDC</span>
                    <p className="mt-1">{score.notes}</p>
                </div>
            )}
        </div>
    );
}
