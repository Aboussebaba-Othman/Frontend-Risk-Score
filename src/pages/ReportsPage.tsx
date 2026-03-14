import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileDown, Loader2, FileText } from 'lucide-react';
import { getCompanies } from '@/lib/api/companies';
import { triggerReport } from '@/lib/api/reports';

export default function ReportsPage() {
    const { data: companies = [], isLoading } = useQuery({ queryKey: ['companies'], queryFn: getCompanies });
    const [downloading, setDownloading] = useState<number | null>(null);

    const handleDownload = async (companyId: number) => {
        setDownloading(companyId);
        try { await triggerReport(companyId); }
        finally { setTimeout(() => setDownloading(null), 1500); }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="glass-card p-4 border-l-2 border-brand/50 text-sm text-gray-400">
                Sélectionnez une entreprise pour générer et télécharger son rapport PDF complet (CDC F-03).
            </div>

            <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                    <FileText size={16} className="text-brand-light" />
                    <h2 className="text-white font-semibold">Générer un rapport</h2>
                </div>

                {isLoading ? (
                    <div className="py-10 text-center text-gray-500">Chargement...</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {companies.map(company => (
                            <div key={company.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium">{company.name}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {company.industry ?? '—'} • {company.country ?? '—'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDownload(company.id)}
                                    disabled={downloading === company.id}
                                    className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg bg-brand/20 hover:bg-brand/30 border border-brand/30 text-brand-light hover:text-white transition-all disabled:opacity-50"
                                >
                                    {downloading === company.id
                                        ? <><Loader2 size={13} className="animate-spin" /> Génération...</>
                                        : <><FileDown size={13} /> Télécharger PDF</>
                                    }
                                </button>
                            </div>
                        ))}
                        {companies.length === 0 && (
                            <div className="py-12 text-center">
                                <FileText size={40} className="text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-400">Aucune entreprise disponible.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
