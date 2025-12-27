import React from 'react';
import { formatMoney } from '../../utils/money';

interface MoneyDisplayProps {
  amountCents: number;
  variant?: 'default' | 'large' | 'small';
  showSign?: boolean;
  color?: 'default' | 'success' | 'danger';
  gross?: number; // Exibe "de R$ X" (secundário)
  className?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amountCents,
  variant = 'default',
  showSign = false,
  color = 'default',
  gross,
  className = '',
}) => {
  const sizeClasses = {
    small: 'text-sm',
    default: 'text-lg font-semibold',
    large: 'text-3xl font-bold',
  };

  const colorClasses = {
    default: 'text-gray-900',
    success: 'text-green-600',
    danger: 'text-red-600',
  };

  return (
    <div className={className}>
      <span className={`${sizeClasses[variant]} ${colorClasses[color]}`}>
        {formatMoney(amountCents, { showSign })}
      </span>
      {gross && (
        <span className="text-sm text-gray-500 ml-2">
          de {formatMoney(gross, { showSign: false })}
        </span>
      )}
    </div>
  );
};
