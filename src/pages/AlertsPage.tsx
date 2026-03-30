import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, Clock, ChevronRight, X, CheckCheck, 
    Activity,  AlertOctagon, AlertTriangle, 
    CheckCircle2, Inbox, BellOff 
} from 'lucide-react';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from '@/lib/api/alerts';
import { getCompany } from '@/lib/api/companies';
import { useAlertStream } from '@/lib/useAlertStream';
import type { Alert } from '@/types';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatRelativeTime } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AlertsPage() {
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'MODERATE' | 'LOW'>('ALL');
    const queryClient = useQueryClient();
    const location = useLocation();
    const navigate = useNavigate();
    
    useAlertStream();

    const { data: alerts = [], isLoading } = useQuery({ 
        queryKey: ['alerts'], 
        queryFn: getAlerts 
    });

    const markReadAction = useMutation({
        mutationFn: (id: number) => markAlertAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        }
    });

    const markAllReadAction = useMutation({
        mutationFn: markAllAlertsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        }
    });

    // Filtering logic
    const filteredAlerts = useMemo(() => {
        let list = alerts;
        if (activeTab === 'CRITICAL') list = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
        if (activeTab === 'MODERATE') list = alerts.filter(a => a.severity === 'WARNING');
        if (activeTab === 'LOW') list = alerts.filter(a => a.severity === 'INFO');
        return list;
    }, [alerts, activeTab]);

    const stats = {
        total: alerts.length,
        unread: alerts.filter(a => !a.isRead).length,
        critical: alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length,
        moderate: alerts.filter(a => a.severity === 'WARNING').length
    };

    const handleSelectAlert = (alert: Alert) => {
        setSelectedAlert(alert);
        if (!alert.isRead) {
            markReadAction.mutate(alert.id);
        }
    };

    // Auto-select alert from location state (e.g. from Notification Dropdown)
    useEffect(() => {
        if (location.state?.selectedAlertId && alerts.length > 0) {
            const targetId = location.state.selectedAlertId;
            const alert = alerts.find(a => a.id === targetId);
            if (alert) {
                handleSelectAlert(alert);
                // Clear state via React Router so refresh doesn't pop it open again
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, alerts, navigate]);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-light/10 text-brand-light">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Centre de Surveillance</h1>
                        <p className="text-gray-400 text-sm">Analysez et gérez les alertes critiques en temps réel.</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => markAllReadAction.mutate()}
                    disabled={stats.unread === 0 || markAllReadAction.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <CheckCheck size={16} className="text-brand-light group-hover:scale-110 transition-transform" />
                    Tout marquer comme lu
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Incidents', value: stats.total, icon: ShieldAlert, color: 'text-brand-light', bg: 'bg-brand-light/5' },
                    { label: 'Urgences', value: stats.critical, icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-500/5' },
                    { label: 'Avertissements', value: stats.moderate, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/5' },
                    { label: 'Messages non lus', value: stats.unread, icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-500/5' }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className={`${stat.bg} border border-white/5 p-4 rounded-2xl relative overflow-hidden group`}
                    >
                        <stat.icon size={60} className={`absolute -bottom-2 -right-2 opacity-[0.03] ${stat.color} group-hover:scale-110 transition-transform`} />
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content: Tabs & List */}
            <div className="flex-1 min-h-0 glass-card border border-white/5 flex flex-col overflow-hidden">
                <div className="flex border-b border-white/5 bg-white/[0.02]">
                    {[
                        { id: 'ALL', label: 'Toutes' },
                        { id: 'CRITICAL', label: 'Critiques' },
                        { id: 'MODERATE', label: 'Modérées' },
                        { id: 'LOW', label: 'Faibles' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                                activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-light" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin divide-y divide-white/5">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                            <Clock className="animate-spin text-brand-light" size={32} />
                            <p className="animate-pulse">Chargement du flux d'événements...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <BellOff className="text-gray-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Silence Radio</h3>
                            <p className="text-gray-400 max-w-sm">Aucun incident ne correspond à ce filtre. Le périmètre de sécurité est dégagé.</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {filteredAlerts.map((alert, idx) => (
                                <AlertRow 
                                    key={alert.id} 
                                    alert={alert} 
                                    idx={idx}
                                    isSelected={selectedAlert?.id === alert.id}
                                    onSelect={() => handleSelectAlert(alert)}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Detail Overlay / Lateral Panel */}
            <AnimatePresence>
                {selectedAlert && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAlert(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <DetailPanel 
                            alert={selectedAlert} 
                            onClose={() => setSelectedAlert(null)} 
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Sub-Component: Alert Row ---
function AlertRow({ alert, idx, isSelected, onSelect }: { alert: Alert, idx: number, isSelected: boolean, onSelect: () => void }) {
    const severityIcons = {
        CRITICAL: <AlertOctagon size={18} className="text-red-500" />,
        HIGH: <AlertOctagon size={18} className="text-red-500" />,
        WARNING: <AlertTriangle size={18} className="text-orange-500" />,
        INFO: <CheckCircle2 size={18} className="text-blue-500" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={onSelect}
            className={`group px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer transition-all border-l-2
                ${isSelected ? 'bg-white/10 border-brand-light' : 'hover:bg-white/5 border-transparent'}
                ${!alert.isRead && !isSelected ? 'bg-brand-light/5' : ''}
            `}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                    ${!alert.isRead ? 'bg-white/10 ring-1 ring-white/10' : 'bg-white/5'}
                `}>
                    {severityIcons[alert.severity as keyof typeof severityIcons] || <ShieldAlert size={18} className="text-brand-light" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`text-sm font-bold truncate ${!alert.isRead ? 'text-white' : 'text-gray-400'}`}>
                            {alert.subject}
                        </span>
                        <RiskBadge level={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'CRITICAL' : 'MODERATE'} />
                        {!alert.isRead && (
                            <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        )}
                    </div>
                    <p className={`text-xs truncate ${!alert.isRead ? 'text-gray-300' : 'text-gray-500'}`}>
                        {alert.message}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium uppercase tracking-wider">
                        <Clock size={12} />
                        {formatRelativeTime(alert.createdAt || new Date().toISOString())}
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">ID: ALT-{alert.id}</span>
                </div>
                <ChevronRight className={`text-gray-700 transition-all ${isSelected ? 'rotate-90 text-brand-light' : 'group-hover:translate-x-1 group-hover:text-gray-400'}`} size={18} />
            </div>
        </motion.div>
    );
}

// --- Sub-Component: Detail Panel ---
function DetailPanel({ alert, onClose }: { alert: Alert, onClose: () => void }) {
    const { data: company, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['company', alert.companyId],
        queryFn: () => (alert.companyId ? getCompany(alert.companyId) : null),
        enabled: !!alert.companyId
    });

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full sm:w-[500px] bg-navy-900 border-l border-white/10 shadow-2xl z-50 flex flex-col"
        >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                    <h3 className="text-xl font-bold text-white">Audit de l'Incident</h3>
                    <p className="text-xs text-brand-light mt-1 font-mono uppercase tracking-widest">Référence: ALT-{alert.id}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                {/* Visual Status Banner */}
                <div className={`p-8 rounded-3xl bg-gradient-to-br border flex flex-col items-center text-center shadow-lg
                    ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'from-red-500/10 to-transparent border-red-500/20' : 'from-brand-light/10 to-transparent border-brand-light/20'}
                `}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-1 
                        ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'bg-red-500/10 ring-red-500/20 text-red-500' : 'bg-brand-light/10 ring-brand-light/20 text-brand-light'}
                    `}>
                        <ShieldAlert size={32} />
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4
                        ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'bg-red-500/20 text-red-500' : 'bg-brand-light/20 text-brand-light'}
                    `}>
                        Alerte {alert.severity}
                    </div>
                    <h4 className="text-xl font-bold text-white leading-tight px-4 capitalize">
                        {alert.subject}
                    </h4>
                </div>

                {/* Company Link Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 group">
                        <Activity size={14} /> Entité Concernée
                    </div>
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="min-w-0">
                            {isLoadingCompany ? (
                                <div className="h-4 w-32 bg-white/5 animate-pulse rounded" />
                            ) : (
                                <>
                                    <p className="text-white font-bold truncate">{company?.name || `Société #${alert.companyId}`}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{company?.registrationNumber || 'No REG_NUM'}</p>
                                </>
                            )}
                        </div>
                        {alert.companyId && (
                            <Link 
                                to={`/companies/${alert.companyId}`}
                                className="px-3 py-1.5 bg-brand-light/10 text-brand-light rounded-lg text-xs font-bold hover:bg-brand-light hover:text-navy-950 transition-all border border-brand-light/20"
                            >
                                Voir Fiche
                            </Link>
                        )}
                    </div>
                </div>

                {/* Message Body */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                        <Inbox size={14} /> Analyse Descriptive
                    </div>
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-sm text-gray-300 leading-relaxed shadow-inner font-light">
                        {alert.message}
                    </div>
                </div>

                {/* Timeline Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
                        <Clock size={14} /> Chronologie
                    </div>
                    <div className="space-y-0.5 relative pl-4 border-l border-white/10 ml-2">
                        <TimelineItem 
                            label="Détection Système" 
                            time={new Date(alert.createdAt).toLocaleString()} 
                            active
                        />
                        <TimelineItem 
                            label="Lecture Utilisateur" 
                            time={alert.readAt ? new Date(alert.readAt).toLocaleString() : 'En attente...'} 
                            active={!!alert.readAt}
                        />
                    </div>
                </div>

                {/* Technical Metadata */}
                <div className="grid grid-cols-2 gap-3 pb-8">
                    <DetailItem label="Statut" value={alert.isRead ? 'Archivé' : 'Action Requise'} highlight={!alert.isRead} />
                    <DetailItem label="Type d'Événement" value={alert.type || 'Automatisé'} />
                    <DetailItem label="Source" value="IA Scoring Engine" />
                    <DetailItem label="UUID Interne" value={`0x${alert.id.toString(16).toUpperCase()}`} />
                </div>
            </div>

            {/* Actions Card */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 backdrop-blur-md">
                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-brand-light text-navy-950 font-black rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-brand-light/30 text-sm uppercase tracking-widest"
                >
                    Clôturer l'Audit
                </button>
            </div>
        </motion.div>
    );
}

function TimelineItem({ label, time, active }: { label: string, time: string, active: boolean }) {
    return (
        <div className="py-2 flex flex-col group">
            <div className={`absolute left-[-5px] top-6 w-2 h-2 rounded-full border border-navy-900 transition-colors ${active ? 'bg-brand-light shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-gray-700'}`} />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{label}</p>
            <p className={`text-xs ${active ? 'text-gray-300' : 'text-gray-600 italic'}`}>{time}</p>
        </div>
    );
}

function DetailItem({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter mb-1">{label}</p>
            <p className={`text-xs font-bold truncate ${highlight ? 'text-brand-light' : 'text-gray-400'}`}>{value}</p>
        </div>
    );
}

