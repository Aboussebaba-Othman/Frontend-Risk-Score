
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const RISK_COLORS: Record<string, string> = {
    EXCELLENT:     '#3d8c6a',
    LOW_RISK:      '#5a9b7a',
    MODERATE_RISK: '#c49a2e',
    MEDIUM_RISK:   '#b5622f',
    HIGH_RISK:     '#a83c3c',
    CRITICAL:      '#7a3060',
};

export const RISK_BG: Record<string, string> = {
    EXCELLENT: 'bg-risk-excellent/20 text-risk-excellent',
    LOW_RISK: 'bg-risk-low/20 text-risk-low',
    MODERATE_RISK: 'bg-risk-moderate/20 text-risk-moderate',
    MEDIUM_RISK: 'bg-risk-medium/20 text-risk-medium',
    HIGH_RISK: 'bg-risk-high/20 text-risk-high',
    CRITICAL: 'bg-risk-critical/20 text-risk-critical',
};

export const RISK_LABELS: Record<string, string> = {
    EXCELLENT: 'Excellent',
    LOW_RISK: 'Faible',
    MODERATE_RISK: 'Modéré',
    MEDIUM_RISK: 'Moyen',
    HIGH_RISK: 'Élevé',
    CRITICAL: 'Critique',
};

export function getRiskColor(level?: string | null): string {
    return RISK_COLORS[level ?? ''] ?? '#6b7280';
}

export function getRiskBg(level?: string | null): string {
    return RISK_BG[level ?? ''] ?? 'bg-gray-500/20 text-gray-400';
}

export function getRiskLabel(level?: string | null): string {
    return RISK_LABELS[level ?? ''] ?? level ?? 'Inconnu';
}

export function formatScore(score?: number | null): string {
    if (score === null || score === undefined) return '—';
    return `${Math.round(score)}/100`;
}

export function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-MA', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export function getAlertRiskLevel(severity?: string): string | undefined {
    switch (severity?.toUpperCase()) {
        case 'CRITICAL': return 'CRITICAL';
        case 'HIGH': return 'HIGH_RISK';
        case 'WARNING': return 'MODERATE_RISK';
        case 'INFO': return 'LOW_RISK';
        default: return undefined;
    }
}

export function formatRelativeTime(dateStr?: string | null): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
        return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}`;
    } else if (diffInHours < 48) {
        return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}`;
    }
    return formatDate(dateStr);
}

