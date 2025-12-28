import React from 'react';
import { formatMoney } from '../lib/utils/money';

interface IncomeCardProps {
  totalNet: number;
  totalGross: number;
  totalTax: number;
}

export function IncomeCard({ totalNet, totalGross, totalTax }: IncomeCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-lg p-6 shadow-sm">
      <h2 className="text-xl mb-4">💰 Renda Líquida da Família</h2>
      <div className="space-y-2">
        <div>
          <p className="text-4xl font-bold text-gray-900">{formatMoney(totalNet)} <span className="text-gray-600 text-sm"> / mês</span></p>
        </div>
      </div>
    </div>
  );
}
