import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { register as registerUser } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const schema = z.object({
    username: z.string().min(3, 'L\'identifiant doit faire au moins 3 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        setSuccess(null);
        try {
            await registerUser({
                username: data.username,
                email: data.email,
                password: data.password,
                roles: ['USER']
            });
            setSuccess('Inscription réussie ! Redirection en cours...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
        }
    };

    return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-in">
                <div className="glass-card p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30 mb-3">
                            <Shield size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Créer un compte</h1>
                        <p className="text-gray-500 text-sm mt-1">Rejoignez RiskAssess Plateform</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <User size={14} className="text-gray-400" /> Identifiant
                            </label>
                            <input
                                {...register('username')}
                                type="text"
                                placeholder="mon_entreprise"
                                className={cn('input-field', errors.username && 'border-red-500/50')}
                            />
                            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Mail size={14} className="text-gray-400" /> Email professionnel
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="contact@entreprise.com"
                                className={cn('input-field', errors.email && 'border-red-500/50')}
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Lock size={14} className="text-gray-400" /> Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn('input-field pr-10', errors.password && 'border-red-500/50')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Lock size={14} className="text-gray-400" /> Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPwd ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn('input-field pr-10', errors.confirmPassword && 'border-red-500/50')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPwd((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-green-400 text-sm">
                                {success}
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting || !!success} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2">
                            {isSubmitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Inscription...</>
                            ) : (
                                'S\'inscrire'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400 border-t border-white/5 pt-4">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/login" className="text-brand hover:text-brand-light font-medium transition-colors">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
