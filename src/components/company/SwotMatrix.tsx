import React, { useMemo } from 'react';
import type { AnalysisResult } from '@/types/analysis';
import { Target, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

interface SwotMatrixProps {
  results: AnalysisResult[];
  isLoading?: boolean;
}

export default function SwotMatrix({ results, isLoading }: SwotMatrixProps) {
  const { strengths, weaknesses, opportunities, threats } = useMemo(() => {
    return {
      strengths: results.filter((r) => r.resultType === 'STRENGTH'),
      weaknesses: results.filter((r) => r.resultType === 'WEAKNESS'),
      opportunities: results.filter((r) => r.resultType === 'OPPORTUNITY'),
      threats: results.filter((r) => r.resultType === 'THREAT'),
    };
  }, [results]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card h-48 rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="glass-card p-10 text-center text-gray-500">
        <p>Aucune donnée SWOT n'est actuellement disponible.</p>
        <p className="text-xs mt-1">Déclenchez une analyse pour peupler cette matrice.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">CRITIQUE</span>;
      case 'HIGH': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">ÉLEVÉ</span>;
      case 'MEDIUM': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">MOYEN</span>;
      default: return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">FAIBLE</span>;
    }
  };

  const renderSection = (title: string, items: AnalysisResult[], icon: React.ReactNode, colorClass: string, bgClass: string) => (
    <div className={`rounded-xl border border-white/5 overflow-hidden flex flex-col h-full bg-navy-800/40 relative`}>
      <div className={`p-3 flex items-center gap-2 border-b border-white/5 ${bgClass}`}>
        <div className={colorClass}>{icon}</div>
        <h3 className={`font-semibold text-sm ${colorClass}`}>{title}</h3>
        <span className="ml-auto text-xs font-medium text-white/50 bg-black/20 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto max-h-[250px] space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-6 italic">Aucun élément détecté.</p>
        ) : (
          items.map((item, idx) => (
             <div key={item.id || idx} className="bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                   <h4 className="text-white text-xs font-semibold leading-snug">{item.title}</h4>
                   {item.severity && getSeverityBadge(item.severity)}
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed mb-2">{item.description}</p>
                {item.recommendation && (
                  <div className="mt-2 text-[10px] bg-brand/10 text-brand-light p-2 rounded border border-brand/20">
                    <span className="font-semibold uppercase tracking-wider text-[9px]">Recommandation :</span> {item.recommendation}
                  </div>
                )}
             </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {renderSection('Forces (Strengths)', strengths, <TrendingUp size={16} />, 'text-emerald-400', 'bg-emerald-500/10')}
      {renderSection('Faiblesses (Weaknesses)', weaknesses, <AlertTriangle size={16} />, 'text-orange-400', 'bg-orange-500/10')}
      {renderSection('Opportunités (Opportunities)', opportunities, <Target size={16} />, 'text-blue-400', 'bg-blue-500/10')}
      {renderSection('Menaces (Threats)', threats, <ShieldAlert size={16} />, 'text-red-400', 'bg-red-500/10')}
    </div>
  );
}
