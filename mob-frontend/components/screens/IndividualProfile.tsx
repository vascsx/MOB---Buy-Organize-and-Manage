import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
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
import { EditIncomeModal } from '../EditIncomeModal';

interface IndividualProfileProps {
  onBack: () => void;
  memberId?: number;
}

export function IndividualProfile({ onBack, memberId }: IndividualProfileProps) {
  const { family, members, fetchMembers } = useFamilyContext();
  const { incomes, breakdown, fetchIncomes, fetchBreakdown, createIncome, deleteIncome, isLoading, error } = useIncomes();
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteIncome = async (incomeId: number) => {
    if (!family) return;
    
    try {
      await deleteIncome(family.id, incomeId);
      setShowDeleteConfirm(false);
      setSelectedIncome(null);
      // Se não houver mais rendas, voltar para lista
      if (incomes.length <= 1) {
        onBack();
      }
    } catch (err) {
      console.error('Erro ao excluir renda:', err);
    }
  };

  const handleEditClick = (income: Income) => {
    setSelectedIncome(income);
    setShowEditModal(true);
  };

  const handleDeleteClick = (income: Income) => {
    setSelectedIncome(income);
    setShowDeleteConfirm(true);
  };

  // Se não houver memberId específico, mostrar todas as rendas
  if (!memberId) {
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
            <h1 className="text-2xl font-bold text-gray-900">Rendas da Família</h1>
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

        {/* Lista de Rendas */}
        <div className="grid gap-4">
          {incomes.map((income) => (
            <Card key={income.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{income.family_member?.name || 'Sem nome'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {income.type.toUpperCase()}
                      </Badge>
                      {income.is_active && (
                        <Badge className="bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs">
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditClick(income)}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(income)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-1">💰 Renda Líquida</p>
                  <p className="text-2xl font-bold text-gray-900">{formatMoney(income.net_monthly_cents || 0)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-1">📊 Renda Bruta</p>
                  <p className="text-2xl font-bold text-gray-900">{formatMoney(income.gross_monthly_cents)}</p>
                </div>
              </div>

              {/* Benefícios */}
              {((income.food_voucher_cents || 0) > 0 || (income.transport_voucher_cents || 0) > 0 || (income.bonus_cents || 0) > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Benefícios</p>
                  <div className="flex gap-4 text-sm">
                    {(income.food_voucher_cents || 0) > 0 && (
                      <span className="text-gray-600">VA: {formatMoney(income.food_voucher_cents || 0)}</span>
                    )}
                    {(income.transport_voucher_cents || 0) > 0 && (
                      <span className="text-gray-600">VT: {formatMoney(income.transport_voucher_cents || 0)}</span>
                    )}
                    {(income.bonus_cents || 0) > 0 && (
                      <span className="text-gray-600">Bônus: {formatMoney(income.bonus_cents || 0)}</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

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

        {showEditModal && selectedIncome && (
          <EditIncomeModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedIncome(null);
            }}
            income={selectedIncome}
            onSuccess={async () => {
              setShowEditModal(false);
              setSelectedIncome(null);
              if (family) {
                await fetchIncomes(family.id);
              }
            }}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && selectedIncome && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Renda</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir a renda de <strong>{selectedIncome.family_member?.name || 'este membro'}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedIncome(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleDeleteIncome(selectedIncome.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modo de visualização de uma renda específica (quando memberId é fornecido)
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
            onClick={() => setShowEditModal(true)}
            variant="outline"
            className="text-sm"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            onClick={() => handleDeleteClick(selectedIncome)}
            variant="outline"
            className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Excluir
          </Button>
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
      {selectedIncome?.type.toUpperCase() === 'CLT' && (
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

      {showEditModal && selectedIncome && (
        <EditIncomeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedIncome(null);
          }}
          income={selectedIncome}
          onSuccess={async () => {
            setShowEditModal(false);
            setSelectedIncome(null);
            if (family) {
              await fetchIncomes(family.id);
            }
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && selectedIncome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Renda</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a renda de <strong>{selectedIncome.family_member?.name || 'este membro'}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedIncome(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDeleteIncome(selectedIncome.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
