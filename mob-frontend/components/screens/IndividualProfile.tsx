import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useIncomes, useFamilies } from '../../hooks';
import { formatMoney, formatPercentage } from '../../lib/utils/money';
import type { Income, IncomeBreakdown } from '../../lib/types/api.types';

interface IndividualProfileProps {
  onBack: () => void;
  memberId?: number;
}

export function IndividualProfile({ onBack, memberId }: IndividualProfileProps) {
  const { currentFamily } = useFamilies();
  const { incomes, breakdown, fetchIncomes, fetchBreakdown, isLoading, error } = useIncomes();
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  useEffect(() => {
    if (currentFamily) {
      fetchIncomes(currentFamily.id);
    }
  }, [currentFamily, fetchIncomes]);

  useEffect(() => {
    if (incomes.length > 0) {
      // Filtrar por memberId se fornecido, ou pegar primeiro
      const income = memberId 
        ? incomes.find(i => i.family_member_id === memberId) 
        : incomes[0];
      
      if (income) {
        setSelectedIncome(income);
        if (currentFamily) {
          fetchBreakdown(currentFamily.id, income.id);
        }
      }
    }
  }, [incomes, memberId, currentFamily, fetchBreakdown]);

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Selecione uma família</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Erro ao carregar dados: {error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !selectedIncome || !breakdown) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  const member = selectedIncome.family_member;
  const discounts = [
    { 
      label: 'INSS', 
      value: breakdown.inss_cents, 
      percentage: breakdown.inss_rate * 100, 
      color: '#EF4444' 
    },
    { 
      label: 'IRPF', 
      value: breakdown.irpf_cents, 
      percentage: breakdown.irpf_rate * 100, 
      color: breakdown.irpf_cents > 0 ? '#F59E0B' : '#E5E7EB'
    },
    { 
      label: 'FGTS*', 
      value: breakdown.fgts_cents, 
      percentage: 8.0, 
      color: '#3B82F6' 
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">
          {member?.name.toUpperCase()} - {selectedIncome.type.toUpperCase()}
        </h1>
        {selectedIncome.is_active && (
          <Badge className="bg-[#10B981] hover:bg-[#10B981]/90 text-white">Ativo</Badge>
        )}
      </div>

      {/* Card Renda Mensal */}
      <Card className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] p-8 shadow-lg text-white">
        <p className="text-base mb-2 opacity-90">💰 Renda Mensal</p>
        <div className="mb-3">
          <p className="text-5xl font-bold">{formatMoney(breakdown.net_monthly_cents)}</p>
        </div>
        <p className="text-sm opacity-80 mb-1">Você recebe líquido</p>
        <p className="text-sm opacity-60">
          (Salário bruto: {formatMoney(breakdown.gross_monthly_cents)})
        </p>
      </Card>

      {/* Descontos Automáticos */}
      <Card className="p-6">
        <h3 className="text-xl mb-5">📉 Descontos Automáticos</h3>
        <div className="space-y-5">
          {discounts.map((discount, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{discount.label}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">
                    {formatMoney(discount.value)}
                  </span>
                  <span className="text-sm text-gray-500 min-w-[60px] text-right">
                    {formatPercentage(discount.percentage)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${discount.percentage}%`,
                    backgroundColor: discount.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs italic text-gray-500 mt-4">*Depositado pela empresa</p>
      </Card>

      {/* Benefícios Adicionais */}
      {(breakdown.food_voucher_cents > 0 || breakdown.transport_voucher_cents > 0 || breakdown.bonus_cents > 0) && (
        <Card className="p-6">
          <h3 className="text-xl mb-4">🎁 Benefícios Adicionais</h3>
          <div className="space-y-2">
            {breakdown.food_voucher_cents > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Vale Alimentação</span>
                <span className="font-semibold">{formatMoney(breakdown.food_voucher_cents)}</span>
              </div>
            )}
            {breakdown.transport_voucher_cents > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Vale Transporte</span>
                <span className="font-semibold">{formatMoney(breakdown.transport_voucher_cents)}</span>
              </div>
            )}
            {breakdown.bonus_cents > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-700">Bônus</span>
                <span className="font-semibold">{formatMoney(breakdown.bonus_cents)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Call to Action */}
      {selectedIncome?.type === 'clt' && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-base font-medium mb-2">🔄 Simular Mudança CLT → PJ</h4>
          <p className="text-sm text-gray-600 mb-4">
            Veja quanto você ganharia trabalhando como PJ
          </p>
          <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">Ver simulação</Button>
        </div>
      )}
    </div>
  );
}
