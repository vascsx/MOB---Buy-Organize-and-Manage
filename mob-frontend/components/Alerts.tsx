import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import type { Alert as AlertType } from '../lib/types/api.types';

interface AlertsProps {
  alerts?: AlertType[];
}

export function Alerts({ alerts = [] }: AlertsProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-4">Alertas</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Info className="w-12 h-12 mb-2" />
          <p className="text-sm">Nenhum alerta no momento</p>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-[#F59E0B]';
      case 'success':
        return 'bg-green-50 border-[#10B981]';
      case 'error':
        return 'bg-red-50 border-[#EF4444]';
      case 'info':
      default:
        return 'bg-blue-50 border-[#3B82F6]';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl mb-4">Alertas</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getStyles(alert.type)}`}
          >
            {getIcon(alert.type)}
            <div className="flex-1">
              <p className="text-sm text-gray-700">{alert.message}</p>
              {alert.category && (
                <span className="text-xs text-gray-500 mt-1 block">{alert.category}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
