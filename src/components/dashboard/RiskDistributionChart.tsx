import { getRiskColor } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
    data: { name: string; value: number; level: string }[];
}

export default function RiskDistributionChart({ data }: Props) {
    if (!data.length) return <p className="text-gray-500 text-sm text-center py-8">Pas de données</p>;
    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {data.map((entry, i) => (
                        <Cell key={i} fill={getRiskColor(entry.level)} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: '#141e35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend
                    formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
