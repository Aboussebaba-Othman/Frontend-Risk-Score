
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const RISK_COLORS: Record<string, string> = {
    EXCELLENT: '#00A36C',
    LOW_RISK: '#2ECC71',
    MODERATE_RISK: '#F39C12',
    MEDIUM_RISK: '#E67E22',
    HIGH_RISK: '#E74C3C',
    CRITICAL: '#8E44AD',
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
