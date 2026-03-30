import { getRiskColor, getRiskLabel, RISK_LABELS } from '@/lib/utils';

interface Props {
    matrix: Record<string, Record<string, number>>;
    sectors: string[];
}

const RISK_ORDER = ['EXCELLENT', 'LOW_RISK', 'MODERATE_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'];

export default function RiskHeatmap({ matrix, sectors }: Props) {
    if (!sectors.length) {
        return <p className="text-corp-muted text-sm text-center py-8">Calculez des scores pour voir la matrice.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr>
                        <th className="text-left pb-2 pr-4 section-label w-32">Secteur</th>
                        {RISK_ORDER.map(level => (
                            <th key={level} className="pb-2 px-1 text-center section-label whitespace-nowrap">
                                {RISK_LABELS[level]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sectors.map(sector => {
                        const row = matrix[sector] ?? {};
                        const rowTotal = Object.values(row).reduce((s, v) => s + v, 0);
                        return (
                            <tr key={sector} className="data-row">
                                <td className="py-2 pr-4 text-white font-medium truncate max-w-[120px]" title={sector}>
                                    {sector}
                                </td>
                                {RISK_ORDER.map(level => {
                                    const count = row[level] ?? 0;
                                    const pct = rowTotal ? count / rowTotal : 0;
                                    const color = getRiskColor(level);
                                    return (
                                        <td key={level} className="py-1.5 px-1 text-center">
                                            {count > 0 ? (
                                                <div
                                                    className="mx-auto flex items-center justify-center rounded font-semibold tabular-nums transition-all"
                                                    style={{
                                                        width: 32,
                                                        height: 24,
                                                        backgroundColor: `${color}${Math.round(pct * 200 + 30).toString(16).padStart(2, '0')}`,
                                                        color: pct > 0.4 ? '#fff' : color,
                                                        fontSize: 11,
                                                    }}
                                                    title={`${count} entreprise${count > 1 ? 's' : ''} ${getRiskLabel(level)}`}
                                                >
                                                    {count}
                                                </div>
                                            ) : (
                                                <span className="text-white/10">·</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
