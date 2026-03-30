import { useEffect, useState } from 'react';

interface Props {
    data: { sector: string; avgScore: number }[];
}

export default function ScoreBySectorChart({ data }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!data.length) return <p className="text-slate-500 text-sm py-8 text-center">Pas de données</p>;

    const getRiskColor = (val: number) => {
        if (val >= 80) return '#059669';
        if (val >= 60) return '#2563eb';
        if (val >= 40) return '#d97706';
        if (val >= 20) return '#ea580c';
        return '#dc2626';
    };

    return (
        <div className="w-full h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-700/40">
                        <th className="pb-2 text-[10px] uppercase tracking-wider text-slate-500 font-medium font-mono">Secteur</th>
                        <th className="pb-2 text-[10px] uppercase tracking-wider text-slate-500 font-medium font-mono w-full px-4">Performance</th>
                        <th className="pb-2 text-[10px] uppercase tracking-wider text-slate-500 font-medium font-mono text-right">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                    {data.map((entry, index) => {
                        const val = Math.round(entry.avgScore);
                        const color = getRiskColor(val);
                        
                        return (
                            <tr key={index} className="group hover:bg-slate-800/20 transition-colors">
                                <td className="py-2.5 pr-2 whitespace-nowrap">
                                    <span className="text-[11px] text-slate-300 font-medium group-hover:text-slate-100 transition-colors tracking-wide">
                                        {entry.sector}
                                    </span>
                                </td>
                                
                                <td className="py-2.5 px-4 w-full align-middle">
                                    <div className="relative flex items-center h-full w-full">
                                        {/* Baseline track */}
                                        <div className="w-full h-[1px] bg-slate-700/50 absolute" />
                                        
                                        {/* Value Bar */}
                                        <div 
                                            className="absolute h-[2px] transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: mounted ? `${Math.max(val, 1)}%` : '0%',
                                                backgroundColor: color
                                            }}
                                        />
                                        
                                        <div 
                                            className="absolute w-[7px] h-[7px] rotate-45 border border-[#0B1221] shadow-sm transition-all duration-1000 ease-out"
                                            style={{ 
                                                left: mounted ? `calc(${Math.max(val, 1)}% - 3.5px)` : '0%',
                                                backgroundColor: color
                                            }}
                                        />
                                    </div>
                                </td>
                                
                                <td className="py-2.5 pl-2 text-right">
                                    <span 
                                        className="text-xs font-semibold tabular-nums tracking-tighter"
                                        style={{ color }}
                                    >
                                        {val}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
