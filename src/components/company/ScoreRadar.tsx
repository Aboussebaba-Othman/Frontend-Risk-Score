import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ScoreRadarProps {
  score: any;
  riskColor: string;
}

export default function ScoreRadar({ score, riskColor }: ScoreRadarProps) {
  if (!score) {
    return (
      <div className="flex items-center justify-center h-full text-center py-6">
        <p className="text-gray-500 text-sm">Synchronisation des données requise.</p>
      </div>
    );
  }

  const radarData = [
    { subject: 'Financier', value: score.financialScore ?? 0, weight: '40%' },
    { subject: 'Paiement', value: score.operationalScore ?? 0, weight: '35%' },
    { subject: 'Marché', value: score.marketScore ?? 0, weight: '25%' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-2">
        <h3 className="text-white font-semibold text-sm">Répartition Analytique</h3>
        <p className="text-gray-500 text-xs">Pondération par catégorie métier</p>
      </div>

      <div className="w-full h-[220px] -mt-4 relative z-0">
        <ResponsiveContainer width="99%" height="100%" minHeight={1} minWidth={1}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#e5e7eb', fontSize: 11, fontWeight: 600 }} 
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar 
              dataKey="value" 
              stroke={riskColor} 
              strokeWidth={3} 
              fill={riskColor} 
              fillOpacity={0.25} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 z-10">
        {radarData.map(({ subject, value, weight }) => (
          <div key={subject} className="bg-gradient-to-b from-white/[0.04] to-transparent rounded-lg p-2.5 border border-white/[0.03] flex flex-col items-center justify-center group hover:bg-white/[0.08] transition-colors cursor-default">
            <span className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider mb-1">{subject}</span>
            <span className="text-white text-lg font-black tracking-tight group-hover:text-brand-light transition-colors">{value}</span>
            <span className="text-brand-light/60 text-[9px] font-medium mt-0.5">Poids: {weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
