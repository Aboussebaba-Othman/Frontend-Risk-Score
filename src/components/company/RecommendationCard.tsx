import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec: any;
}

export default function RecommendationCard({ rec }: RecommendationCardProps) {
  if (!rec) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-6">
        <p className="text-gray-500 text-sm">Générez un score pour voir les décisions.</p>
      </div>
    );
  }

  const isAccord = rec.decision?.startsWith('ACCORD');
  const isRefus = rec.decision === 'REFUS';
  const decColor = isAccord ? '#10B981' : isRefus ? '#EF4444' : '#F59E0B';
  const Icon = isAccord ? CheckCircle2 : AlertCircle;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Décision de Crédit</h3>
          <p className="text-gray-500 text-xs">Framework d'octroi F-03</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
          Automatisé
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl p-4 mb-4 border" style={{ backgroundColor: `${decColor}10`, borderLeft: `4px solid ${decColor}` }}>
        <div className="flex items-start gap-3 relative z-10">
          <Icon size={24} style={{ color: decColor }} className="mt-0.5" />
          <div>
            <h4 className="text-lg font-black tracking-tight leading-tight" style={{ color: decColor }}>{rec.decision}</h4>
            <p className="text-xs text-white/70 font-medium leading-relaxed mt-1">{rec.decisionLabel}</p>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: decColor }} />
      </div>

      <div className="space-y-3 flex-1">
        {[
          { label: 'Exposition Plafond', value: rec.creditLimitPolicy || 'Non applicable' },
          { label: 'Délai accordé', value: rec.maxPaymentDays ? `${rec.maxPaymentDays} jours net` : 'Comptant' },
          { label: 'Collatéral & Garanties', value: rec.guaranteesRequired || 'Aucune garantie standard' },
          { label: 'Probabilité de Défaut', value: rec.defaultRateRange || 'Non calculé' }
        ].map(item => (
          <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-white/[0.03] last:border-0 relative">
            <span className="text-gray-400 text-xs font-medium z-10">{item.label}</span>
            <span className="text-white text-xs font-semibold text-right sm:max-w-[55%] leading-snug z-10">{item.value}</span>
          </div>
        ))}
      </div>

      {rec.justification && rec.justification.length > 0 && (
        <div className="mt-4 pt-3 bg-white/[0.02] rounded-lg p-3">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            Motifs techniques
          </p>
          <ul className="space-y-1.5 custom-scrollbar max-h-24 overflow-y-auto pr-2">
            {rec.justification.map((reason: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-gray-600 mt-0.5 text-[10px]">■</span>
                <span className="leading-relaxed opacity-90">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
