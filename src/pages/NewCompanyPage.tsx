import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft, ArrowRight, Building2, MapPin, BarChart3,
    Loader2, Check, AlertCircle,
} from 'lucide-react';
import { createCompany, getCompany, updateCompany } from '@/lib/api/companies';

const schema = z.object({
    name: z.string().min(2, 'Raison sociale requise'),
    registrationNumber: z.string().min(1, 'N° RC requis'),
    taxId: z.string().optional(),
    legalForm: z.string().optional(),
    industry: z.string().optional(),
    incorporationDate: z.string().optional(),
    status: z.string().optional(),
    // Step 2 – Contact & Location
    country: z.string().min(1, 'Pays requis'),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    website: z.string().optional(),
    // Step 3 – Financials
    employeeCount: z.coerce.number().nonnegative().optional(),
    shareCapital: z.coerce.number().nonnegative().optional(),
    annualRevenue: z.coerce.number().nonnegative().optional(),
});
type FormData = z.infer<typeof schema>;

/* ─── Data ───────────────────────────────────────────────────────────────── */
const INDUSTRIES = [
    'TECH', 'HEALTH', 'AGROALIMENTAIRE', 'BTP', 'COMMERCE',
    'FINANCE', 'INDUSTRIE', 'LOGISTIQUE', 'EDUCATION',
];
const FORMS = ['SARL', 'SA', 'SNC', 'SCS', 'GIE', 'Auto-entrepreneur'];

/* ─── Step labels ────────────────────────────────────────────────────────── */
const STEPS = [
    { label: 'Identité', icon: Building2 },
    { label: 'Contact', icon: MapPin },
    { label: 'Financier', icon: BarChart3 },
];

/* ─── Helper: Field wrapper ──────────────────────────────────────────────── */
function Field({
    label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
                {label} {required && <span className="text-blue-400">*</span>}
            </label>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle size={11} /> {error}
                </p>
            )}
        </div>
    );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function NewCompanyPage() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const companyId = isEditMode ? Number(id) : undefined;
    const qc = useQueryClient();

    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register, handleSubmit, trigger, setValue, formState: { errors, isSubmitting },
    } = useForm<FormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema) as any,
        defaultValues: { country: 'Maroc', status: 'ACTIVE' },
    });

    const { data: existingCompany, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['company', companyId],
        queryFn: () => getCompany(companyId!),
        enabled: isEditMode
    });

    useEffect(() => {
        if (existingCompany) {
            Object.keys(existingCompany).forEach(k => {
                const key = k as keyof FormData;
                const value = existingCompany[k as keyof typeof existingCompany];
                if (value !== null && value !== undefined) {
                    if (key === 'incorporationDate' && value) {
                        setValue(key, (value as string).split('T')[0]);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setValue(key as any, value);
                    }
                }
            });
        }
    }, [existingCompany, setValue]);

    /* Validate current step before proceeding */
    const STEP_FIELDS: (keyof FormData)[][] = [
        ['name', 'registrationNumber', 'taxId', 'legalForm', 'industry', 'incorporationDate', 'status'],
        ['country', 'city', 'address', 'phone', 'email', 'website'],
        ['employeeCount', 'shareCapital', 'annualRevenue'],
    ];

    const nextStep = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        const fields = STEP_FIELDS[step];
        const valid = await trigger(fields);
        if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1));
    };
    const prevStep = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setStep(s => Math.max(s - 1, 0));
    };

    const onSubmit = async (data: FormData) => {
        setServerError(null);
        try {
            if (isEditMode) {
                await updateCompany(companyId!, data as Partial<import('@/types').Company>);
                qc.invalidateQueries({ queryKey: ['company', companyId] });
                qc.invalidateQueries({ queryKey: ['companies'] });
                navigate(`/companies/${companyId}`);
            } else {
                const company = await createCompany(data as Partial<import('@/types').Company>);
                qc.invalidateQueries({ queryKey: ['companies'] });
                navigate(`/companies/${company.id}`);
            }
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setServerError(err.response?.data?.message ?? (isEditMode ? 'Erreur lors de la mise à jour.' : 'Erreur lors de la création.'));
            setStep(0);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Back */}
            <Link
                to="/companies"
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
                <ArrowLeft size={14} /> Retour aux entreprises
            </Link>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    {isEditMode ? "Modifier l'entreprise" : "Nouvelle entreprise"}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    {isEditMode 
                        ? "Mettez à jour les informations de l'entité existante." 
                        : "Renseignez les informations pour enregistrer une nouvelle entité."}
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const done = i < step;
                    const active = i === step;
                    return (
                        <div key={i} className="flex-1 flex items-center">
                            <div className={`flex items-center gap-2 flex-1 ${i < STEPS.length - 1 ? 'pr-2' : ''}`}>
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
                                    ${done ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                        : active ? 'bg-blue-500/20 border border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                        : 'bg-white/5 border border-white/10 text-gray-500'}
                                `}>
                                    {done ? <Check size={13} /> : <Icon size={13} />}
                                </div>
                                <span className={`text-xs font-medium transition-colors ${active ? 'text-blue-400' : done ? 'text-green-400' : 'text-gray-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-px flex-1 mx-3 transition-all duration-500 ${done ? 'bg-green-500/40' : 'bg-white/10'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Card */}
            <div className="glass-card p-7 relative">
                {isLoadingCompany && (
                    <div className="absolute inset-0 z-50 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <Loader2 className="animate-spin text-brand-light" size={24} />
                    </div>
                )}
                <form 
                    onSubmit={handleSubmit((data) => onSubmit(data as FormData))} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && step < STEPS.length - 1) {
                            e.preventDefault();
                            nextStep();
                        }
                    }}
                    noValidate
                >
                    {/* ── Step 0: Identité ── */}
                    {step === 0 && (
                        <div className="space-y-5 animate-fade-in">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Informations légales</p>

                            <Field label="Raison sociale" error={errors.name?.message} required>
                                <input
                                    {...register('name')}
                                    className="input-field"
                                    placeholder="ex : TechInnovate SA"
                                />
                            </Field>

                            <Field label="N° Registre de Commerce (RC)" error={errors.registrationNumber?.message} required>
                                <input
                                    {...register('registrationNumber')}
                                    className="input-field"
                                    placeholder="ex : 123456"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="ICE / Tax ID" error={errors.taxId?.message}>
                                    <input
                                        {...register('taxId')}
                                        className="input-field"
                                        placeholder="000000000000000"
                                    />
                                </Field>
                                <Field label="Forme juridique" error={errors.legalForm?.message}>
                                    <select {...register('legalForm')} className="input-field">
                                        <option value="">Sélectionner</option>
                                        {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Secteur d'activité" error={errors.industry?.message}>
                                    <select {...register('industry')} className="input-field">
                                        <option value="">Sélectionner</option>
                                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </Field>
                                <Field label="Date de création" error={errors.incorporationDate?.message}>
                                    <input {...register('incorporationDate')} type="date" className="input-field" />
                                </Field>
                            </div>

                            <Field label="Statut" error={errors.status?.message}>
                                <select {...register('status')} className="input-field">
                                    <option value="ACTIVE">Actif</option>
                                    <option value="INACTIVE">Inactif</option>
                                    <option value="SUSPENDED">Suspendu</option>
                                </select>
                            </Field>
                        </div>
                    )}

                    {/* ── Step 1: Contact ── */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Coordonnées</p>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Pays" error={errors.country?.message}>
                                    <input {...register('country')} className="input-field" placeholder="Maroc" />
                                </Field>
                                <Field label="Ville" error={errors.city?.message}>
                                    <input {...register('city')} className="input-field" placeholder="Casablanca" />
                                </Field>
                            </div>

                            <Field label="Adresse complète" error={errors.address?.message}>
                                <input {...register('address')} className="input-field" placeholder="Boulevard Mohammed V, N°45" />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Téléphone" error={errors.phone?.message}>
                                    <input {...register('phone')} className="input-field" placeholder="+212 5XX XX XX XX" />
                                </Field>
                                <Field label="Email" error={errors.email?.message}>
                                    <input {...register('email')} type="email" className="input-field" placeholder="contact@entreprise.ma" />
                                </Field>
                            </div>

                            <Field label="Site web" error={errors.website?.message}>
                                <input {...register('website')} className="input-field" placeholder="https://www.exemple.ma" />
                            </Field>
                        </div>
                    )}

                    {/* ── Step 2: Financiers ── */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Données financières</p>

                            <Field label="Effectif (nb. employés)" error={errors.employeeCount?.message}>
                                <input {...register('employeeCount')} type="number" min={0} className="input-field" placeholder="250" />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Capital social (MAD)" error={errors.shareCapital?.message}>
                                    <input {...register('shareCapital')} type="number" min={0} className="input-field" placeholder="1 000 000" />
                                </Field>
                                <Field label="Chiffre d'affaires annuel (MAD)" error={errors.annualRevenue?.message}>
                                    <input {...register('annualRevenue')} type="number" min={0} className="input-field" placeholder="5 000 000" />
                                </Field>
                            </div>

                            {/* Summary preview */}
                            <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-gray-400 space-y-1">
                                <p className="text-gray-300 font-medium text-xs uppercase tracking-wide mb-2">Vérification finale</p>
                                <p>Cliquez sur <strong className="text-white">{isEditMode ? "Mettre à jour" : "Créer l'entreprise"}</strong> pour enregistrer la fiche.</p>
                                <p>Les données financières détaillées (bilans, ratios) pourront être ajustées ultérieurement.</p>
                            </div>

                            {serverError && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                                    <AlertCircle size={14} /> {serverError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Navigation ── */}
                    <div className="flex gap-3 mt-8 pt-5 border-t border-white/10">
                        {step === 0 ? (
                            <Link to="/companies" className="flex-1 text-center btn-ghost py-2.5 text-sm border border-white/10 rounded-lg">
                                Annuler
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex-1 flex items-center justify-center gap-2 btn-ghost py-2.5 text-sm border border-white/10 rounded-lg"
                            >
                                <ArrowLeft size={14} /> Précédent
                            </button>
                        )}

                        {step < STEPS.length - 1 ? (
                            <button
                                key="btn-next"
                                type="button"
                                onClick={nextStep}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
                            >
                                Suivant <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button
                                key="btn-submit"
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
                            >
                                {isSubmitting
                                    ? <><Loader2 size={14} className="animate-spin" /> {isEditMode ? "Mise à jour..." : "Création en cours..."}</>
                                    : <><Check size={14} /> {isEditMode ? "Mettre à jour" : "Créer l'entreprise"}</>
                                }
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
