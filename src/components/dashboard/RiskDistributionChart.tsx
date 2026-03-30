import { getRiskColor } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
    data: { name: string; value: number; level: string }[];
}

export default function RiskDistributionChart({ data }: Props) {
    if (!data.length) return <p className="text-gray-500 text-sm text-center py-8">Pas de données</p>;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="relative w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie 
                        data={data} 
                        cx="50%" 
                        cy="70%" 
                        innerRadius={65} 
                        outerRadius={90} 
                        paddingAngle={4} 
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        stroke="rgba(0,0,0,0)"
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={getRiskColor(entry.level)} className="hover:opacity-80 transition-opacity" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#141e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: '#9ca3af' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-400 text-xs ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center top-6">
                <span className="text-3xl font-bold text-white">{total}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Total</span>
            </div>
        </div>
    );
}
