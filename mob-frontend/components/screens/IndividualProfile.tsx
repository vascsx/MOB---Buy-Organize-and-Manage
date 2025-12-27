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
import { AddIncomeModal } from '../AddIncomeModal';
import { AddMemberModal } from '../AddMemberModal';

interface IndividualProfileProps {
  onBack: () => void;
  memberId?: number;
}

export function IndividualProfile({ onBack, memberId }: IndividualProfileProps) {
  const { family, members, fetchMembers } = useFamilyContext();
  const { incomes, breakdown, fetchIncomes, fetchBreakdown, createIncome, isLoading, error } = useIncomes();
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    if (family) {
      fetchIncomes(family.id);
      fetchMembers();
    }
  }, [family, fetchIncomes, fetchMembers]);

  useEffect(() => {
    if (incomes.length > 0) {
      // Filtrar por memberId se fornecido, ou pegar primeiro
      const income = memberId 
        ? incomes.find(i => i.family_member_id === memberId) 
        : incomes[0];
      
      if (income) {
        setSelectedIncome(income);
        // Apenas buscar breakdown se necessário (para ter taxas detalhadas)
        // Mas podemos usar os dados do income diretamente
        if (family) {
          fetchBreakdown(family.id, income.id);
        }
      }
    } else {
      // Se não houver mais incomes, limpar seleção
      setSelectedIncome(null);
    }
  }, [incomes, memberId, family, fetchBreakdown]);

  if (!family) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Nenhuma família encontrada</p>
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

        {members.length === 0 ? (
          <Card className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum membro cadastrado</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Primeiro, adicione os membros da família para depois cadastrar as rendas
            </p>
            <Button 
              onClick={() => setShowAddMemberModal(true)}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            >
              + Adicionar Membro
            </Button>
          </Card>
        ) : (
          <Card className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma renda cadastrada</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comece adicionando as rendas dos membros da família para ter um controle completo das finanças
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            >
              + Adicionar Renda
            </Button>
          </Card>
        )}

        {/* Modal de adicionar membro */}
        {showAddMemberModal && (
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            onSuccess={() => {
              setShowAddMemberModal(false);
              if (family) {
                fetchMembers();
              }
            }}
          />
        )}

        {/* Modal de adicionar renda */}
        {showAddModal && (
          <AddIncomeModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={async () => {
              setShowAddModal(false);
              if (family) {
                await fetchIncomes(family.id);
              }
            }}
          />
        )}
      </div>
    );
  }

  if (!selectedIncome) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  const member = selectedIncome.family_member;

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
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddMemberModal(true)}
            variant="outline"
            className="text-sm"
          >
            + Adicionar Membro
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm"
          >
            + Adicionar Renda
          </Button>
        </div>
      </div>

      {/* Card Renda Mensal */}
      <Card className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-700 mb-2">💰 Renda Mensal</p>
        <div className="mb-3">
          <p className="text-4xl font-bold text-gray-900">{formatMoney(selectedIncome.net_monthly_cents || 0)}</p>
          <span className="text-gray-600 text-sm"> / mês (líquido)</span>
        </div>
      </Card>

      {/* Benefícios Adicionais */}
      {((selectedIncome.food_voucher_cents || 0) > 0 || (selectedIncome.transport_voucher_cents || 0) > 0 || (selectedIncome.bonus_cents || 0) > 0) && (
        <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎁 Benefícios Adicionais</h3>
          <div className="space-y-3">
            {(selectedIncome.food_voucher_cents || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Vale Alimentação</span>
                <span className="font-semibold text-gray-900">{formatMoney(selectedIncome.food_voucher_cents || 0)}</span>
              </div>
            )}
            {(selectedIncome.transport_voucher_cents || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Vale Transporte</span>
                <span className="font-semibold text-gray-900">{formatMoney(selectedIncome.transport_voucher_cents || 0)}</span>
              </div>
            )}
            {(selectedIncome.bonus_cents || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Bônus</span>
                <span className="font-semibold text-gray-900">{formatMoney(selectedIncome.bonus_cents || 0)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Call to Action */}
      {selectedIncome?.type === 'CLT' && (
        <Card className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-lg p-6 shadow-sm border border-blue-100">
          <h4 className="text-base font-semibold text-gray-900 mb-2">🔄 Simular Mudança CLT → PJ</h4>
          <p className="text-sm text-gray-600 mb-4">
            Veja quanto você ganharia trabalhando como PJ
          </p>
          <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">Ver simulação</Button>
        </Card>
      )}

      {/* Modais */}
      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onSuccess={() => {
            setShowAddMemberModal(false);
            if (family) {
              fetchMembers();
            }
          }}
        />
      )}

      {showAddModal && (
        <AddIncomeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false);
            if (family) {
              await fetchIncomes(family.id);
            }
          }}
        />
      )}
    </div>
  );
}
