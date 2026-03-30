import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Check,  ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Alert } from '@/types';
import { getAlertRiskLevel } from '@/lib/utils';
import api from '@/lib/api/axios';
import { createPortal } from 'react-dom';

interface NotificationDropdownProps {
    alerts: Alert[];
}

export default function NotificationDropdown({ alerts }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const unreadAlerts = alerts.filter(a => !a.isRead);
    const recentAlerts = unreadAlerts.slice(0, 5);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                dropdownRef.current && !dropdownRef.current.contains(target) &&
                (!portalRef.current || !portalRef.current.contains(target))
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        queryClient.setQueryData<Alert[]>(['alerts'], (old = []) => 
            old.map(a => a.id === id ? { ...a, isRead: true } : a)
        );

        try {
            await api.put(`/alerts/${id}/read`);
        } catch (error) {
            console.error('Failed to mark alert as read on server', error);
        }
    };

    const handleAlertClick = (alert: Alert) => {
        if (!alert.isRead) {
            markAsRead(alert.id);
        }
        setIsOpen(false);
        navigate('/alerts', { state: { selectedAlertId: alert.id } });
    };

    const markAllAsRead = async () => {
        queryClient.setQueryData<Alert[]>(['alerts'], (old = []) => 
            old.map(a => ({ ...a, isRead: true }))
        );

        try {
            await api.put('/alerts/mark-all-read');
        } catch (error) {
            console.error('Error marking all as read remotely', error);
        }
    };

    const getIcon = (alert: Alert) => {
        const level = alert.riskLevel || getAlertRiskLevel(alert.severity);
        if (level === 'CRITICAL' || level === 'HIGH_RISK') return <ShieldAlert className="text-risk-high" size={16} />;
        if (level === 'MODERATE_RISK' || level === 'MEDIUM_RISK') return <AlertTriangle className="text-risk-moderate" size={16} />;
        return <CheckCircle2 className="text-risk-low" size={16} />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                aria-label="Notifications"
            >
                <Bell size={18} />
                {unreadAlerts.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-risk-high text-[10px] font-bold text-white items-center justify-center">
                            {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                        </span>
                    </span>
                )}
            </button>
            {isOpen && createPortal(    
                <div ref={portalRef} className="fixed top-16 right-6 w-80 sm:w-96 bg-navy-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[9999] animate-fade-in-up">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-navy-900/50">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadAlerts.length > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-brand-light hover:text-brand-light/80 transition-colors flex items-center gap-1"
                            >
                                <Check size={12} /> Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {alerts.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <Bell size={32} className="opacity-20 mb-2" />
                                <p className="text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {recentAlerts.map(alert => (
                                    <div 
                                        key={alert.id}
                                        onClick={() => handleAlertClick(alert)}
                                        className={`flex gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors relative group ${!alert.isRead ? 'bg-brand-light/5' : ''}`}
                                    >
                                        {!alert.isRead && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-light rounded-r-md" />
                                        )}
                                        <div className="shrink-0 mt-0.5 flex">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                {getIcon(alert)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${!alert.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                {alert.subject || alert.title}
                                            </p>
                                            <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 group-hover:text-gray-300 transition-colors">
                                                {alert.message}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">
                                                {new Date(alert.createdAt || '').toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2 border-t border-white/5 bg-navy-900/30">
                        <button 
                            onClick={() => { setIsOpen(false); navigate('/alerts'); }}
                            className="w-full py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                        >
                            Voir toutes les alertes
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
