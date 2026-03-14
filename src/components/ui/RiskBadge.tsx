import { getRiskBg, getRiskLabel } from '@/lib/utils';

interface Props {
    level?: string | null;
    className?: string;
}

export default function RiskBadge({ level, className = '' }: Props) {
    const colorClass = getRiskBg(level);
    return (
        <span className={`risk-badge ${colorClass} ${className}`}>
            {getRiskLabel(level)}
        </span>
    );
}
