import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const schema = z.object({
    username: z.string().min(1, 'Identifiant requis'),
    password: z.string().min(1, 'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setToken = useAuthStore((s) => s.setToken);
    const setUser = useAuthStore((s) => s.setUser);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { username: 'admin', password: 'admin123' },
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            const res = await login(data);
            setToken(res.accessToken);
            setUser({ username: data.username });
            navigate('/dashboard');
        } catch {
            setError('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
        }
    };

    return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
            {/* Background gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-in">
                <div className="glass-card p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30 mb-4">
                            <Shield size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">RiskAssess</h1>
                        <p className="text-gray-500 text-sm mt-1">CDC Risk Assessment Platform</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Identifiant
                            </label>
                            <input
                                {...register('username')}
                                type="text"
                                placeholder="admin"
                                className={cn('input-field', errors.username && 'border-red-500/50 focus:ring-red-500/30')}
                            />
                            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Mot de passe
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

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                            {isSubmitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Connexion...</>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400 border-t border-white/5 pt-4">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="text-brand hover:text-brand-light font-medium transition-colors">
                            S'inscrire
                        </Link>
                    </div>

                    <p className="text-center text-gray-600 text-xs mt-6">
                        Risk Assessment Platform © 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
