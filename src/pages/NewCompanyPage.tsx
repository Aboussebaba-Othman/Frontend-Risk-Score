import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createCompany } from '@/lib/api/companies';
import { Link } from 'react-router-dom';

const schema = z.object({
    name: z.string().min(2, 'Nom requis'),
    taxId: z.string().optional(),
    industry: z.string().optional(),
    legalForm: z.string().optional(),
    incorporationDate: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    employeeCount: z.coerce.number().optional(),
    status: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const INDUSTRIES = ['TECH', 'HEALTH', 'AGROALIMENTAIRE', 'BTP', 'COMMERCE', 'FINANCE', 'INDUSTRIE', 'LOGISTIQUE', 'EDUCATION'];
const FORMS = ['SARL', 'SA', 'SNC', 'SCS', 'GIE', 'Auto-entrepreneur'];

export default function NewCompanyPage() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { country: 'Maroc', status: 'ACTIVE' } });

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            const company = await createCompany(data);
            navigate(`/companies/${company.id}`);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erreur lors de la création.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
            <Link to="/companies" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={15} /> Retour
            </Link>

            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-6">Nouvelle Entreprise</h2>

                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Raison sociale *</label>
                        <input {...register('name')} className="input-field" placeholder="ex: CDC SARL" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">ICE / Tax ID</label>
                            <input {...register('taxId')} className="input-field" placeholder="000000000000000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Forme juridique</label>
                            <select {...register('legalForm')} className="input-field">
                                <option value="">Sélectionner</option>
                                {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Secteur d'activité</label>
                            <select {...register('industry')} className="input-field">
                                <option value="">Sélectionner</option>
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Date de création</label>
                            <input {...register('incorporationDate')} type="date" className="input-field" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Pays</label>
                            <input {...register('country')} className="input-field" placeholder="Maroc" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Ville</label>
                            <input {...register('city')} className="input-field" placeholder="Casablanca" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Effectif</label>
                            <input {...register('employeeCount')} type="number" className="input-field" placeholder="50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Statut</label>
                            <select {...register('status')} className="input-field">
                                <option value="ACTIVE">Actif</option>
                                <option value="INACTIVE">Inactif</option>
                                <option value="SUSPENDED">Suspendu</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link to="/companies" className="flex-1 text-center btn-ghost py-2.5 text-sm border border-white/10 rounded-lg">
                            Annuler
                        </Link>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
                            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Création...</> : 'Créer l\'entreprise'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
