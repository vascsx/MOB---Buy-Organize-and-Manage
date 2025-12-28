import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import { Progress } from './ui/progress';

interface FinancialHealthProps {
  score: number;
  expenseRatio?: number;      // % de gastos sobre renda
  hasInvestments?: boolean;    // tem investimentos ativos
  emergencyProgress?: number;  // % da reserva de emergência
  hasPositiveBalance?: boolean; // sobra dinheiro
}

export function FinancialHealth({ 
  score, 
  expenseRatio = 0,
  hasInvestments = false,
  emergencyProgress = 0,
  hasPositiveBalance = false
}: FinancialHealthProps) {
  const getStatusLabel = (score: number) => {
    if (score >= 80) return { text: 'Excelente', color: '#10B981' };
    if (score >= 65) return { text: 'Bom', color: '#10B981' };
    if (score >= 40) return { text: 'Regular', color: '#F59E0B' };
    return { text: 'Precisa melhorar', color: '#EF4444' };
  };

  const indicators = [
    { 
      label: 'Despesas controladas', 
      status: expenseRatio < 50 ? 'good' : expenseRatio < 70 ? 'warning' : 'bad',
      detail: expenseRatio > 0 ? `${expenseRatio.toFixed(0)}% da renda` : 'Sem gastos registrados',
      maxPoints: 30,
      actualPoints: expenseRatio === 0 ? 30 : expenseRatio < 50 ? 30 : expenseRatio < 70 ? Math.round(30 * (70 - expenseRatio) / 20) : 0
    },
    { 
      label: 'Possui investimentos', 
      status: hasInvestments ? 'good' : 'bad',
      detail: hasInvestments ? 'Investindo mensalmente' : 'Sem investimentos',
      maxPoints: 25,
      actualPoints: hasInvestments ? 25 : 0
    },
    { 
      label: 'Reserva de emergência', 
      status: emergencyProgress >= 100 ? 'good' : emergencyProgress >= 50 ? 'warning' : 'bad',
      detail: emergencyProgress > 0 ? `${emergencyProgress.toFixed(0)}% concluída` : 'Não configurada',
      maxPoints: 25,
      actualPoints: Math.round(emergencyProgress * 25 / 100)
    },
    { 
      label: 'Saldo positivo', 
      status: hasPositiveBalance ? 'good' : 'bad',
      detail: hasPositiveBalance ? 'Sobra dinheiro' : 'Gastos igualam renda',
      maxPoints: 20,
      actualPoints: hasPositiveBalance ? 20 : 0
    },
  ];

  const calculatedScore = indicators.reduce((sum, indicator) => sum + indicator.actualPoints, 0);
  const finalScore = calculatedScore;

  const status = getStatusLabel(finalScore);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl mb-5">Saúde Financeira</h3>
      
      <div className="flex items-end gap-4 mb-6">
        <div>
          <p className="text-5xl font-bold" style={{ color: status.color }}>{finalScore}</p>
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
        <Progress value={finalScore} className="h-3" />
      </div>

      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-start gap-3">
            {indicator.status === 'good' ? (
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : indicator.status === 'warning' ? (
              <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{indicator.label}</p>
                <span className="text-xs text-gray-500">
                  {indicator.actualPoints}/{indicator.maxPoints} pts
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{indicator.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
