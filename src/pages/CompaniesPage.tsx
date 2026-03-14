import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, Calculator } from 'lucide-react';
import { getCompanies } from '@/lib/api/companies';
import { calculateScore } from '@/lib/api/scores';


export default function CompaniesPage() {
    const [search, setSearch] = useState('');
    const qc = useQueryClient();

    const { data: companies = [], isLoading } = useQuery({
        queryKey: ['companies'],
        queryFn: getCompanies,
    });

    const scoreMutation = useMutation({
        mutationFn: calculateScore,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
    });

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une entreprise..."
                        className="input-field pl-9 py-2"
                    />
                </div>
                <Link to="/companies/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                    <Plus size={16} /> Nouvelle entreprise
                </Link>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="py-12 text-center text-gray-500">Chargement...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center">
                            <Building2 size={40} className="text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-400">Aucune entreprise trouvée.</p>
                            <Link to="/companies/new" className="btn-primary inline-flex mt-4 gap-1">
                                <Plus size={15} /> Ajouter
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    {['Entreprise', 'Secteur', 'Pays', 'Statut', 'Actions'].map(h => (
                                        <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(company => (
                                    <tr key={company.id} className="hover:bg-white/3 transition-colors group">
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="text-white font-medium group-hover:text-brand-light transition-colors">
                                                    {company.name}
                                                </p>
                                                {company.taxId && (
                                                    <p className="text-gray-500 text-xs mt-0.5">ICE: {company.taxId}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300">{company.industry ?? '—'}</td>
                                        <td className="px-4 py-3.5 text-gray-400">{company.country ?? '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
                                                {company.status ?? 'Actif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/companies/${company.id}`}
                                                    className="text-brand-light text-xs hover:underline"
                                                >
                                                    Voir
                                                </Link>
                                                <button
                                                    onClick={() => scoreMutation.mutate(company.id)}
                                                    disabled={scoreMutation.isPending}
                                                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                                    title="Calculer le score CDC"
                                                >
                                                    <Calculator size={13} />
                                                    {scoreMutation.isPending ? '...' : 'Score'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {filtered.length > 0 && (
                    <div className="px-4 py-3 border-t border-white/5 text-gray-500 text-xs">
                        {filtered.length} entreprise{filtered.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}
