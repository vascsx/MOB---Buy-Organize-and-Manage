import React from 'react';
import { formatMoney } from '../lib/utils/money';

interface SummaryItem {
  label: string;
  amount: string;
  percentage: number;
  color: string;
}

interface MonthSummaryProps {
  totalNet: number;
  expenses: number;
  investments: number;
  available: number;
}

export function MonthSummary({ totalNet, expenses, investments, available }: MonthSummaryProps) {
  const calcPercentage = (value: number) => totalNet > 0 ? Math.round((value / totalNet) * 100) : 0;
  
  const items: SummaryItem[] = [
    { label: 'Despesas', amount: formatMoney(expenses), percentage: calcPercentage(expenses), color: '#EF4444' },
    { label: 'Investimentos', amount: formatMoney(investments), percentage: calcPercentage(investments), color: '#3B82F6' },
    { label: 'Sobrou', amount: formatMoney(available), percentage: calcPercentage(available), color: '#86EFAC' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl mb-5">Resumo do Mês</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{item.amount}</span>
                <span className="text-xs text-gray-500 w-10 text-right">{item.percentage}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end px-2"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              >
                <span className="text-xs text-white font-medium">{item.percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
