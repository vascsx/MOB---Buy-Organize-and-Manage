import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Progress } from './ui/progress';

interface FinancialHealthProps {
  score: number;
}

export function FinancialHealth({ score }: FinancialHealthProps) {
  const getStatusLabel = (score: number) => {
    if (score >= 80) return { text: 'Excelente', color: '#10B981' };
    if (score >= 60) return { text: 'Bom', color: '#10B981' };
    if (score >= 40) return { text: 'Regular', color: '#F59E0B' };
    return { text: 'Precisa melhorar', color: '#EF4444' };
  };

  const status = getStatusLabel(score);
  
  const indicators = [
    { label: 'Despesas controladas', status: score >= 60 ? 'good' : 'warning' },
    { label: 'Reserva de emergência', status: score >= 70 ? 'good' : 'warning' },
    { label: 'Investimentos', status: score >= 50 ? 'good' : 'warning' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl mb-5">Saúde Financeira</h3>
      
      <div className="flex items-end gap-4 mb-6">
        <div>
          <p className="text-5xl font-bold" style={{ color: status.color }}>{score}</p>
          <p className="text-sm text-gray-500">de 100</p>
        </div>
        <div className="mb-2">
          <span 
            className="inline-block px-3 py-1 text-white rounded-full text-sm font-medium"
            style={{ backgroundColor: status.color }}
          >
            {status.text}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <Progress value={score} className="h-3" />
      </div>

      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-center gap-3">
            {indicator.status === 'good' ? (
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            )}
            <p className="text-sm text-gray-700">{indicator.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
