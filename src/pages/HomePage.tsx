import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Shield, BarChart3, PieChart, Activity, 
    ArrowRight, CheckCircle2, Globe, Rocket 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

    return (
        <div className="min-h-screen bg-navy-950 text-white selection:bg-brand/30">
            <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/50 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
                            <Shield size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">RiskAssess</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
                        <a href="#stats" className="hover:text-white transition-colors">Analyses</a>
                        <a href="#contact" className="hover:text-white transition-colors">À propos</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-primary py-2 px-5 text-sm">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                    Connexion
                                </Link>
                                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                                    Démarrer
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-40 overflow-hidden">
                    {/* Background Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-bold uppercase tracking-wider mb-6">
                                    <Rocket size={14} /> Plateforme Prochaine Génération
                                </span>
                                <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8 lg:mb-10">
                                    Anticipez les <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-indigo-400">risques financiers</span> avec précision.
                                </h1>
                                <p className="text-lg lg:text-xl text-gray-400 mb-10 lg:mb-12 leading-relaxed">
                                    Une plateforme d'analyse stratégique centralisée pour évaluer la santé financière des entreprises, générer des matrices SWOT intelligentes et surveiller les alertes de risques critiques.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/register" className="btn-primary py-4 px-8 text-base flex items-center justify-center gap-2 group">
                                        Commencer l'analyse <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <a href="#features" className="py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-center">
                                        Découvrir les fonctionnalités
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 bg-navy-900/50 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Puissance d'analyse centralisée</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Des outils de pointe pour les analystes de crédit et les gestionnaires de risques, intégrés dans une interface fluide et intelligente.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <FeatureCard 
                                icon={Activity}
                                title="Scoring en Temps Réel"
                                description="Algorithmes de calcul de score basés sur les fondamentaux financiers et les incidents de paiement."
                                delay={0.1}
                            />
                            <FeatureCard 
                                icon={BarChart3}
                                title="Matrices SWOT"
                                description="Génération de diagnostics stratégiques automatiques (Forces, Faiblesses, Opportunités, Menaces)."
                                delay={0.2}
                            />
                            <FeatureCard 
                                icon={CheckCircle2}
                                title="Décisionnels Crédit"
                                description="Recommandations d'octroi de crédit et limites de paiement basées sur le niveau de risque."
                                delay={0.3}
                            />
                        </div>
                    </div>
                </section>

                {/* Stats / Proof Section */}
                <section id="stats" className="py-32 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="glass-card p-12 lg:p-20 relative overflow-hidden border-brand/20">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/10 to-transparent" />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">Précision et Rapidité.</h2>
                                    <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                                        Notre architecture distribuée en microservices permet un traitement de données à grande échelle sans compromis sur la rapidité des analyses stratégiques.
                                    </p>
                                    <ul className="space-y-4">
                                        <StatItem text="Traitement d'analyses SWOT en moins de 500ms" />
                                        <StatItem text="Surveillance multi-services continue" />
                                        <StatItem text="Interface de monitoring temps réel reactive" />
                                    </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-6 relative">
                                    <StatCard label="Analyses / jour" value="+12k" />
                                    <StatCard label="Précision" value="99.8%" />
                                    <StatCard label="Temps de réponse" value="12ms" />
                                    <StatCard label="Alertes critiques" value="100%" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <h2 className="text-4xl font-bold mb-6 italic tracking-tight">Prêt à transformer votre gestion des risques ?</h2>
                        <p className="text-gray-400 mb-10 text-lg">
                            Rejoignez la nouvelle ère de l'évaluation financière intelligente dès aujourd'hui.
                        </p>
                        <Link to="/register" className="btn-primary py-5 px-12 text-lg shadow-2xl shadow-brand/40">
                            Créer un compte maintenant
                        </Link>
                    </div>
                </section>
            </main>

            <footer id="contact" className="py-12 border-t border-white/5 bg-navy-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm">© 2026 RiskAssess Platform. Tous droits réservés.</p>
                    <div className="flex items-center gap-6 text-gray-500 text-xs font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Sécurité</a>
                        <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                        <a href="#" className="hover:text-white transition-colors">API Documentation</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-brand/20 transition-all group"
        >
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand-light flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

function StatItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-brand-light">
                <CheckCircle2 size={12} />
            </div>
            {text}
        </li>
    );
}

function StatCard({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
        </div>
    );
}
