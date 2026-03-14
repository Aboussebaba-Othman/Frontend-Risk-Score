import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { addFinancialData } from '@/lib/api/companies';
import { useState } from 'react';

const num = z.coerce.number().optional();
const schema = z.object({
    fiscalYear: z.coerce.number().min(2000).max(2030),
    revenue: num, netResult: num, totalAssets: num, totalLiabilities: num, equity: num,
    currentAssets: num, currentLiabilities: num, cash: num, inventory: num,
    accountsReceivable: num, accountsPayable: num, longTermDebt: num, fixedAssets: num,
    operatingIncome: num, financialExpenses: num, ebitda: num, costOfGoodsSold: num,
    shareCapital: num, employeeCount: num,
    totalPayments: num, onTimePayments: num, latePayments: num,
    unpaidCount: num, litigationCount: num, averagePaymentDelay: num,
});
type FormData = z.infer<typeof schema>;

const Field = ({ label, name, register, type = 'number', placeholder = '0' }: any) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input {...register(name)} type={type} placeholder={placeholder}
            className="input-field py-2 text-sm" />
    </div>
);

export default function FinancialsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { fiscalYear: new Date().getFullYear() - 1 } });

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            await addFinancialData(Number(id), data);
            navigate(`/companies/${id}`);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erreur lors de la sauvegarde.');
        }
    };

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div>
            <h3 className="text-white font-semibold text-sm mb-3 pb-2 border-b border-white/10">{title}</h3>
            <div className="grid grid-cols-2 gap-3">{children}</div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
            <Link to={`/companies/${id}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <ArrowLeft size={15} /> Retour au profil
            </Link>

            <div className="glass-card p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Données Financières</h2>
                    <p className="text-gray-500 text-sm mt-1">Saisir les données pour le calcul CDC (15 ratios)</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Exercice fiscal *</label>
                        <input {...register('fiscalYear')} type="number" className="input-field py-2 w-40" />
                    </div>

                    <Section title="Bilan — Actif">
                        <Field label="Total Actif (MAD)" name="totalAssets" register={register} />
                        <Field label="Actif Circulant (MAD)" name="currentAssets" register={register} />
                        <Field label="Actif Immobilisé (MAD)" name="fixedAssets" register={register} />
                        <Field label="Stocks (MAD)" name="inventory" register={register} />
                        <Field label="Créances Clients (MAD)" name="accountsReceivable" register={register} />
                        <Field label="Trésorerie (MAD)" name="cash" register={register} />
                    </Section>

                    <Section title="Bilan — Passif">
                        <Field label="Total Passif (MAD)" name="totalLiabilities" register={register} />
                        <Field label="Capitaux Propres (MAD)" name="equity" register={register} />
                        <Field label="Passif Circulant (MAD)" name="currentLiabilities" register={register} />
                        <Field label="Dettes LT (MAD)" name="longTermDebt" register={register} />
                        <Field label="Dettes Fourn. (MAD)" name="accountsPayable" register={register} />
                        <Field label="Capital Social (MAD)" name="shareCapital" register={register} />
                    </Section>

                    <Section title="Compte de Résultat">
                        <Field label="Chiffre d'Affaires (MAD)" name="revenue" register={register} />
                        <Field label="Résultat Net (MAD)" name="netResult" register={register} />
                        <Field label="Résultat Exploitation" name="operatingIncome" register={register} />
                        <Field label="EBITDA (MAD)" name="ebitda" register={register} />
                        <Field label="Charges Financières" name="financialExpenses" register={register} />
                        <Field label="Coût des ventes (MAD)" name="costOfGoodsSold" register={register} />
                    </Section>

                    <Section title="Historique de Paiement">
                        <Field label="Total Paiements" name="totalPayments" register={register} />
                        <Field label="Paiements à temps" name="onTimePayments" register={register} />
                        <Field label="Paiements en retard" name="latePayments" register={register} />
                        <Field label="Impayés" name="unpaidCount" register={register} />
                        <Field label="Litiges" name="litigationCount" register={register} />
                        <Field label="Délai moyen (jours)" name="averagePaymentDelay" register={register} />
                    </Section>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link to={`/companies/${id}`} className="flex-1 text-center btn-ghost py-2.5 border border-white/10 rounded-lg text-sm">
                            Annuler
                        </Link>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
                            {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Sauvegarde...</> : 'Enregistrer et calculer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
