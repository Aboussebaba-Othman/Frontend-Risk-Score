import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRiskColor } from '@/lib/utils';
import RiskBadge from '@/components/ui/RiskBadge';

interface ExposureEntry {
    companyId: number;
    companyName: string;
    industry?: string;
    score: number;
    riskLevel: string;
}

interface Props {
    top: ExposureEntry[];      
    critical: ExposureEntry[]; 
}

function ExposureRow({ entry, }: { entry: ExposureEntry; variant: 'good' | 'bad' }) {
    const color = getRiskColor(entry.riskLevel);
    return (
        <tr className="data-row">
            <td className="py-2 pr-3">
                <div className="flex items-center gap-2">
                    <span
                        className="w-1.5 h-5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{entry.companyName}</p>
                        <p className="text-corp-muted text-2xs truncate">{entry.industry ?? '—'}</p>
                    </div>
                </div>
            </td>
            <td className="py-2 pr-3 text-right">
                <span className="tabular-nums text-xs font-semibold" style={{ color }}>
                    {Math.round(entry.score)}
                </span>
                <span className="text-corp-muted text-2xs">/100</span>
            </td>
            <td className="py-2 pr-2">
                <RiskBadge level={entry.riskLevel} />
            </td>
            <td className="py-2 text-right">
                <Link to={`/companies/${entry.companyId}`} className="text-brand-light hover:text-white transition-colors">
                    <ArrowRight size={13} />
                </Link>
            </td>
        </tr>
    );
}

export default function ExposureTables({ top, critical }: Props) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-risk-excellent flex-shrink-0" />
                    <h3 className="text-white text-sm font-semibold">Top Performers</h3>
                    <span className="ml-auto text-2xs text-corp-muted tabular-nums">{top.length} entreprises</span>
                </div>
                {top.length === 0 ? (
                    <p className="text-corp-muted text-xs py-4 text-center">Aucun résultat</p>
                ) : (
                    <table className="w-full">
                        <tbody>
                            {top.map(e => <ExposureRow key={e.companyId} entry={e} variant="good" />)}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={14} className="text-risk-high flex-shrink-0" />
                    <h3 className="text-white text-sm font-semibold">Expositions Critiques</h3>
                    <span className="ml-auto text-2xs text-corp-muted tabular-nums">{critical.length} entreprises</span>
                </div>
                {critical.length === 0 ? (
                    <p className="text-corp-muted text-xs py-4 text-center">Aucun risque critique détecté</p>
                ) : (
                    <table className="w-full">
                        <tbody>
                            {critical.map(e => <ExposureRow key={e.companyId} entry={e} variant="bad" />)}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
