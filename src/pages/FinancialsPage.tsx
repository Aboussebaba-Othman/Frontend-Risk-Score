import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Loader2, ChevronRight, ChevronLeft, 
    Calculator, Receipt, CreditCard, PieChart, 
    CheckCircle2, Info, Building2, TrendingUp 
} from 'lucide-react';
import { addFinancialData, getCompany, getLatestFinancials } from '@/lib/api/companies';
import { calculateScore } from '@/lib/api/scores';

const num = z.coerce.number().optional();
const schema = z.object({
    fiscalYear: z.coerce.number().min(2000).max(2030),
    periodEndDate: z.string().min(1, "Date d'arrêté requise"),
    revenue: num, netResult: num, totalAssets: num, totalLiabilities: num, equity: num,
    currentAssets: num, currentLiabilities: num, cash: num, inventory: num,
    accountsReceivable: num, accountsPayable: num, longTermDebt: num, fixedAssets: num,
    operatingIncome: num, financialExpenses: num, ebitda: num, costOfGoodsSold: num,
    shareCapital: num, employeeCount: num,
    totalPayments: num, onTimePayments: num, latePayments: num,
    unpaidCount: num, litigationCount: num, averagePaymentDelay: num,
});
type FormData = z.infer<typeof schema>;

const STEPS = [
    { id: 'actif', label: 'Bilan Actif', icon: Calculator, fields: ['fiscalYear', 'periodEndDate', 'totalAssets', 'currentAssets', 'fixedAssets', 'inventory', 'accountsReceivable', 'cash'] },
    { id: 'passif', label: 'Bilan Passif', icon: Receipt, fields: ['totalLiabilities', 'equity', 'currentLiabilities', 'longTermDebt', 'accountsPayable', 'shareCapital'] },
    { id: 'resultat', label: 'Rendement', icon: PieChart, fields: ['revenue', 'netResult', 'operatingIncome', 'ebitda', 'financialExpenses', 'costOfGoodsSold'] },
    { id: 'paiement', label: 'Paiements', icon: CreditCard, fields: ['totalPayments', 'onTimePayments', 'latePayments', 'unpaidCount', 'litigationCount', 'averagePaymentDelay'] }
];

export default function FinancialsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [activeStep, setActiveStep] = useState(0);
    const [serverError, setServerError] = useState<string | null>(null);

    const { data: company, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['company', id],
        queryFn: () => getCompany(Number(id)),
        enabled: !!id
    });

    const { data: latestData } = useQuery({
        queryKey: ['latestFinancials', id],
        queryFn: () => getLatestFinancials(Number(id)),
        enabled: !!id,
        retry: false
    });

    const { register, handleSubmit, trigger, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema) as any, 
        defaultValues: { 
            fiscalYear: new Date().getFullYear() - 1,
            periodEndDate: `${new Date().getFullYear() - 1}-12-31`
        },
        mode: 'onChange'
    });

    React.useEffect(() => {
        if (latestData) {
            Object.keys(latestData).forEach(key => {
                const value = latestData[key as keyof typeof latestData];
                if (value !== null && value !== undefined) {
                    setValue(key as keyof FormData, value);
                }
            });
        }
    }, [latestData, setValue]);

    const nextStep = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        const fieldsToValidate = STEPS[activeStep].fields;
        const isStepValid = await trigger(fieldsToValidate as (keyof FormData)[]);
        if (isStepValid) {
            setServerError(null);
            setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => {
        setServerError(null);
        setActiveStep(prev => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data: FormData) => {
        setServerError(null);
        try {
            await addFinancialData(Number(id), data);
            
            try {
                await calculateScore(Number(id));
                qc.invalidateQueries({ queryKey: ['score', Number(id)] });
                qc.invalidateQueries({ queryKey: ['history', Number(id)] });
                qc.invalidateQueries({ queryKey: ['rec', Number(id)] });
            } catch (calcError) {
                console.error("Failed to auto-calculate score:", calcError);
            }
            
            navigate(`/companies/${id}`);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setServerError(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-fade-in relative pb-10">
            {/* Header Navigation */}
            <div className="flex items-center justify-between blur-in">
                <Link to={`/companies/${id}`} className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all text-sm font-medium">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    Retour au Profil
                </Link>
                
                <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-brand-light bg-brand-light/5 px-2 py-1 rounded-md border border-brand-light/10">
                        MODE ÉDITION EXPERTE
                     </span>
                </div>
            </div>

            <div className="glass-card p-6 border-l-4 border-brand-light shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Building2 size={120} />
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <h2 className="text-2xl font-black text-white tracking-tight">
                                {isLoadingCompany ? "Chargement..." : company?.name}
                             </h2>
                             {company?.status && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20 uppercase tracking-tighter">
                                    {company.status}
                                </span>
                             )}
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Saisie des données pour l'analyse des risques (Ratios CDC)</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Fiscalité</p>
                            <p className="text-white font-mono text-sm">{company?.taxId || 'N/A'}</p>
                        </div>
                        <div className="px-4 py-2 bg-brand-light/10 rounded-xl border border-brand-light/20">
                            <p className="text-[10px] uppercase font-bold text-brand-light/60 tracking-widest mb-1">Employés</p>
                            <p className="text-brand-light font-black text-sm">{company?.employeeCount || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    {STEPS.map((step, idx) => (
                        <div 
                            key={step.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border
                                ${activeStep === idx 
                                    ? 'bg-brand-light/10 border-brand-light/20 text-brand-light shadow-lg shadow-brand-light/5' 
                                    : (idx < activeStep ? 'bg-green-500/5 border-green-500/10 text-green-500' : 'bg-white/[0.02] border-white/5 text-gray-600 opacity-60')}
                            `}
                        >
                            <div className={`p-2 rounded-xl ${activeStep === idx ? 'bg-brand-light/20' : (idx < activeStep ? 'bg-green-500/20' : 'bg-white/5')}`}>
                                {idx < activeStep ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">Étape {idx + 1}</p>
                                <p className="text-sm font-bold truncate">{step.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Panels */}
                <div className="flex-1 w-full glass-card p-8 border border-white/5 relative shadow-inner">
                    <form 
                        onSubmit={handleSubmit(onSubmit)} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && activeStep < STEPS.length - 1) {
                                e.preventDefault();
                                nextStep();
                            }
                        }}
                        className="space-y-8"
                    >
                        {activeStep === 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pb-6 border-b border-white/5 mb-8"
                            >
                                <div className="flex flex-col gap-2 max-w-xs">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp size={14} className="text-brand-light" />
                                        Exercice Fiscal Ciblé
                                    </label>
                                    <input 
                                        {...register('fiscalYear')} 
                                        type="number" 
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-xl focus:ring-2 focus:ring-brand-light/50 transition-all"
                                    />
                                    {errors.fiscalYear && <p className="text-red-500 text-xs">{errors.fiscalYear.message}</p>}
                                    <p className="text-[10px] text-gray-500 italic">L'analyse sera basée sur cette période comptable.</p>
                                </div>
                                
                                <div className="flex flex-col gap-2 max-w-xs">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-brand-light" />
                                        Date d'arrêté
                                    </label>
                                    <input 
                                        {...register('periodEndDate')} 
                                        type="date" 
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-xl focus:ring-2 focus:ring-brand-light/50 transition-all"
                                    />
                                    {errors.periodEndDate && <p className="text-red-500 text-xs">{errors.periodEndDate.message}</p>}
                                    <p className="text-[10px] text-gray-500 italic">Date de clôture de l'exercice comptable.</p>
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
                            >
                                {activeStep === 0 && (
                                    <>
                                        <Field label="Total Actif" name="totalAssets" register={register} description="Somme de tous les avoirs" />
                                        <Field label="Actif Circulant" name="currentAssets" register={register} description="Disponibilités à court terme" />
                                        <Field label="Actif Immobilisé" name="fixedAssets" register={register} />
                                        <Field label="Stocks" name="inventory" register={register} />
                                        <Field label="Créances Clients" name="accountsReceivable" register={register} />
                                        <Field label="Trésorerie" name="cash" register={register} highlight />
                                    </>
                                )}
                                {activeStep === 1 && (
                                    <>
                                        <Field label="Total Passif" name="totalLiabilities" register={register} />
                                        <Field label="Capitaux Propres" name="equity" register={register} highlight />
                                        <Field label="Passif Circulant" name="currentLiabilities" register={register} />
                                        <Field label="Dettes LT" name="longTermDebt" register={register} />
                                        <Field label="Dettes Fournisseurs" name="accountsPayable" register={register} />
                                        <Field label="Capital Social" name="shareCapital" register={register} />
                                    </>
                                )}
                                {activeStep === 2 && (
                                    <>
                                        <Field label="Chiffre d'Affaires" name="revenue" register={register} highlight />
                                        <Field label="Résultat Net" name="netResult" register={register} />
                                        <Field label="Résultat Exploitation" name="operatingIncome" register={register} />
                                        <Field label="EBITDA" name="ebitda" register={register} />
                                        <Field label="Charges Financières" name="financialExpenses" register={register} />
                                        <Field label="Coût des Ventes (COGS)" name="costOfGoodsSold" register={register} />
                                    </>
                                )}
                                {activeStep === 3 && (
                                    <>
                                        <Field label="Total Paiements" name="totalPayments" register={register} />
                                        <Field label="Paiements à temps" name="onTimePayments" register={register} highlight />
                                        <Field label="Paiements en retard" name="latePayments" register={register} />
                                        <Field label="Impayés / Défauts" name="unpaidCount" register={register} />
                                        <Field label="Litiges" name="litigationCount" register={register} />
                                        <Field label="Délai Moyen (Jours)" name="averagePaymentDelay" register={register} />
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Error Handling */}
                        {serverError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-center gap-3">
                                <Info size={18} /> {serverError}
                            </div>
                        )}

                        {/* Navigation Actions */}
                        <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-10">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={activeStep === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all disabled:opacity-30 border border-white/10"
                            >
                                <ChevronLeft size={18} /> Précédent
                            </button>

                            {activeStep < STEPS.length - 1 ? (
                                <button
                                    key="next-button"
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-brand-light text-navy-950 font-black rounded-xl hover:scale-[1.05] transition-all shadow-lg shadow-brand-light/30 text-sm"
                                >
                                    Suivant <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    key="submit-button"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 bg-green-500 text-navy-950 font-black rounded-xl hover:scale-[1.05] transition-all shadow-lg shadow-green-500/30 text-sm"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Finaliser & Calculer
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Field({ label, name, register, description, highlight = false }: any) {
    return (
        <div className="space-y-1.5 group">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">{label}</label>
                {highlight && <span className="text-[9px] font-bold text-brand-light/60 uppercase group-hover:text-brand-light transition-colors">Ratio Clé</span>}
            </div>
            <div className={`relative rounded-xl overflow-hidden transition-all duration-300 border focus-within:ring-2
                ${highlight ? 'bg-brand-light/5 border-brand-light/20 focus-within:ring-brand-light/30' : 'bg-white/5 border-white/10 focus-within:ring-white/20'}
            `}>
                <input
                    {...register(name)}
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className="w-full bg-transparent px-4 py-3 text-white text-sm font-semibold placeholder:text-gray-700 outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-700 group-focus-within:text-gray-500 transition-colors uppercase">
                    MAD
                </div>
            </div>
            {description && <p className="text-[10px] text-gray-600 pl-1 italic">{description}</p>}
        </div>
    );
}
