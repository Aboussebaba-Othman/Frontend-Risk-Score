import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { getRiskLabel } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface ScoreGaugeProps {
  score: any;
  overallScore: number;
  riskColor: string;
}

export default function ScoreGauge({ score, overallScore, riskColor }: ScoreGaugeProps) {
  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-6">
        <Shield size={32} className="text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">Aucun score calculé.</p>
        <p className="text-gray-500 text-xs mt-1">Cliquez sur "Calculer le score" en haut à droite.</p>
      </div>
    );
  }

  const gaugeData = [{ name: 'Score', value: overallScore, fill: riskColor }];
  const label = getRiskLabel(score.riskLevel);
  const isGood = score.riskLevel === 'EXCELLENT' || score.riskLevel === 'LOW_RISK';
  const Icon = isGood ? ShieldCheck : ShieldAlert;

  return (
    <div className="flex flex-col items-center justify-between h-full w-full">
      <div className="flex items-center justify-between w-full mb-2">
        <div>
          <h3 className="text-white font-semibold text-sm">Score de Risque Global</h3>
          <p className="text-gray-500 text-xs">Synthèse des 15 ratios</p>
        </div>
        <div className="bg-navy-800 p-2 rounded-lg border border-white/5">
          <Icon size={18} style={{ color: riskColor }} />
        </div>
      </div>

      <div className="relative w-[180px] h-[180px] my-auto">
        <ResponsiveContainer width="99%" height="100%" minHeight={1} minWidth={1}>
          <RadialBarChart 
            cx="50%" cy="50%" 
            innerRadius="70%" 
            outerRadius="100%"
            startAngle={225} 
            endAngle={-45} 
            data={gaugeData}
          >
            <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="value" cornerRadius={12} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
          <span className="text-5xl font-black tracking-tighter" style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}40` }}>
            {Math.round(overallScore)}
          </span>
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Sur 100</span>
        </div>
      </div>

      <div className="w-full bg-navy-800/50 rounded-xl p-3 border border-white/5 backdrop-blur-sm mt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Niveau:</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${riskColor}20`, color: riskColor }}>
            {label}
          </span>
        </div>
        {score.confidenceLevel != null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
              <span>Indice de confiance</span>
              <span className="text-white">{score.confidenceLevel}%</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${score.confidenceLevel}%`, backgroundColor: riskColor, boxShadow: `0 0 10px ${riskColor}` }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
