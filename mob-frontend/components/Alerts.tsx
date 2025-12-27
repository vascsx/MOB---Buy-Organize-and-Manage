import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AlertItem {
  type: 'warning' | 'success';
  message: string;
}

export function Alerts() {
  const alerts: AlertItem[] = [
    {
      type: 'warning',
      message: 'Gasto com alimentação 15% acima do normal',
    },
    {
      type: 'success',
      message: 'Meta de investimento atingida este mês',
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl mb-4">Alertas</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
              alert.type === 'warning'
                ? 'bg-orange-50 border-[#F59E0B]'
                : 'bg-green-50 border-[#10B981]'
            }`}
          >
            {alert.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-gray-700">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
