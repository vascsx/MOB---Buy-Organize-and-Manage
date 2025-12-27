import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { useIncomes } from '../../hooks';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { formatMoney, formatPercentage } from '../../lib/utils/money';
import type { Income, IncomeBreakdown } from '../../lib/types/api.types';

interface IndividualProfileProps {
  onBack: () => void;
  memberId?: number;
}

export function IndividualProfile({ onBack, memberId }: IndividualProfileProps) {
  const { currentFamily } = useFamilyContext();
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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  // Se não há rendas cadastradas, mostrar estado inicial
  if (incomes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Rendas da Família</h1>
        </div>

        <Card className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma renda cadastrada</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comece adicionando as rendas dos membros da família para ter um controle completo das finanças
          </p>
          <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
            + Adicionar Renda
          </Button>
        </Card>
      </div>
    );
  }

  if (!selectedIncome || !breakdown) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {member?.name}
            </h1>
            <Badge variant="secondary" className="text-xs">
              {selectedIncome.type.toUpperCase()}
            </Badge>
            {selectedIncome.is_active && (
              <Badge className="bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs">
                Ativo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Card Renda Mensal */}
      <Card className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-700 mb-2">💰 Renda Mensal</p>
        <div className="mb-3">
          <p className="text-4xl font-bold text-gray-900">{formatMoney(breakdown.net_monthly_cents)}</p>
          <span className="text-gray-600 text-sm"> / mês</span>
        </div>
        <p className="text-sm text-gray-600">
          {formatMoney(breakdown.gross_monthly_cents)} bruto
        </p>
      </Card>

      {/* Descontos Automáticos */}
      <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-5">Descontos Automáticos</h3>
        <div className="space-y-5">
          {discounts.map((discount, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{discount.label}</span>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">
                    {formatMoney(discount.value)}
                  </span>
                  <span className="text-sm text-gray-500 min-w-[60px] text-right">
                    {formatPercentage(discount.percentage)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end px-2 transition-all"
                  style={{
                    width: `${Math.min(discount.percentage, 100)}%`,
                    backgroundColor: discount.color,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {formatPercentage(discount.percentage)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs italic text-gray-500 mt-4">*Depositado pela empresa</p>
      </Card>

      {/* Benefícios Adicionais */}
      {(breakdown.food_voucher_cents > 0 || breakdown.transport_voucher_cents > 0 || breakdown.bonus_cents > 0) && (
        <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎁 Benefícios Adicionais</h3>
          <div className="space-y-3">
            {breakdown.food_voucher_cents > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Vale Alimentação</span>
                <span className="font-semibold text-gray-900">{formatMoney(breakdown.food_voucher_cents)}</span>
              </div>
            )}
            {breakdown.transport_voucher_cents > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Vale Transporte</span>
                <span className="font-semibold text-gray-900">{formatMoney(breakdown.transport_voucher_cents)}</span>
              </div>
            )}
            {breakdown.bonus_cents > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Bônus</span>
                <span className="font-semibold text-gray-900">{formatMoney(breakdown.bonus_cents)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Call to Action */}
      {selectedIncome?.type === 'clt' && (
        <Card className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-lg p-6 shadow-sm border border-blue-100">
          <h4 className="text-base font-semibold text-gray-900 mb-2">🔄 Simular Mudança CLT → PJ</h4>
          <p className="text-sm text-gray-600 mb-4">
            Veja quanto você ganharia trabalhando como PJ
          </p>
          <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">Ver simulação</Button>
        </Card>
      )}
    </div>
  );
}
