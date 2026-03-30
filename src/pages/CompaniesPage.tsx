import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, MapPin, Target } from 'lucide-react';
import { getCompanies } from '@/lib/api/companies';
import { getAllScores } from '@/lib/api/scores';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatScore } from '@/lib/utils';

export default function CompaniesPage() {
    const [search, setSearch] = useState('');

    // Fetch data
    const { data: companies = [], isLoading: isLoadingComps } = useQuery({
        queryKey: ['companies'],
        queryFn: getCompanies,
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
    }, {} as Record<number, any>), [scores]);

    // Filter
    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.taxId ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Building2 className="text-brand-light" />
                        Répertoire des Entreprises
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Gérez votre portefeuille client et évaluez instantanément leur solvabilité financière via le moteur CDC.</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, secteur ou ICE..."
                        className="input-field pl-10 py-2.5 w-full bg-navy-900/50 border-white/10"
                    />
                </div>
                <div className="flex gap-3 ml-auto w-full sm:w-auto">
                    <button className="btn-secondary flex-1 sm:flex-none justify-center">Exporter CSV</button>
                    <Link to="/companies/new" className="btn-primary flex-1 sm:flex-none flex justify-center items-center gap-2 whitespace-nowrap">
                        <Plus size={16} /> Ajouter
                    </Link>
                </div>
            </div>

            {/* Main Data Table */}
            <div className="glass-card overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1 bg-navy-900/20">
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-gray-500">
                            <div className="animate-spin mb-4 w-8 h-8 border-2 border-brand-light border-t-transparent rounded-full" />
                            <p>Chargement du portefeuille...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-brand-light/10 flex items-center justify-center mb-4">
                                <Building2 size={32} className="text-brand-light" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Aucune entreprise trouvée</h3>
                            <p className="text-gray-500 text-sm max-w-sm mb-6">
                                {search ? `Aucun résultat pour "${search}". Essayez un autre terme de recherche.` : "Votre répertoire est vide. Commencez par ajouter votre première entreprise client."}
                            </p>
                            {!search && (
                                <Link to="/companies/new" className="btn-primary inline-flex gap-2">
                                    <Plus size={16} /> Créer une fiche entreprise
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        {['Raison Sociale', 'Secteur d\'activité', 'Localisation', 'Score', 'Risque Global', 'Actions'].map(h => (
                                            <th key={h} className="text-xs text-gray-400 font-semibold px-6 py-4 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.map(company => {
                                        const cScore = latestScoresMap[company.id];

                                        return (
                                            <tr key={company.id} className="hover:bg-white/5 transition-colors group cursor-default">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded bg-brand-light/10 flex items-center justify-center text-brand-light font-bold">
                                                            {company.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <Link to={`/companies/${company.id}`} className="text-white font-medium hover:text-brand-light transition-colors">
                                                                {company.name}
                                                            </Link>
                                                            <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-2">
                                                                <span>ICE: {company.taxId || 'N/A'}</span>
                                                                {company.status === 'ACTIVE' && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Actif" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Target size={14} className="text-gray-500" />
                                                        {company.industry ?? 'Non spécifié'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-gray-500" />
                                                        {company.country ?? 'Maroc'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {cScore ? (
                                                        <span className="font-mono text-white bg-white/5 px-2 py-1 rounded">
                                                            {formatScore(cScore.overallScore)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 text-xs italic">Non évalué</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {cScore ? (
                                                        <RiskBadge level={cScore.riskLevel} />
                                                    ) : (
                                                        <span className="text-gray-500 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            to={`/companies/${company.id}`}
                                                            className="btn-secondary px-3 py-1.5 text-xs font-medium hover:text-white"
                                                        >
                                                            Détails
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between bg-navy-900/40">
                        <span className="text-gray-400 text-sm">
                            Affiche <strong className="text-white">{filtered.length}</strong> entreprise(s)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
