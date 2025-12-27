import React from 'react';
import { Badge } from './ui/badge';

interface PersonCardProps {
  name: string;
  amount: string;
  type: string;
  status: string;
}

export function PersonCard({ name, amount, type, status }: PersonCardProps) {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {type}
          </Badge>
          <Badge className="text-xs bg-[#10B981] hover:bg-[#10B981]/90 text-white">
            {status}
          </Badge>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{amount}</p>
      <p className="text-sm text-gray-500 mt-1">Recebido</p>
    </div>
  );
}
