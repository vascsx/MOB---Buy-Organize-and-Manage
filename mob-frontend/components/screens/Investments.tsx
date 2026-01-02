import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInvestments } from '../../hooks';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { formatMoney } from '../../lib/utils/money';
import { getInvestmentTypeIcon, getInvestmentTypeName } from '../../lib/utils/investment';
import { useToast } from '../../hooks/useToast';
import { AddInvestmentModal } from '../AddInvestmentModal';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export function Investments() {
  const { family } = useFamilyContext();
  const {
    investments,
    summary,
    projections,
    selectedProjection,
    isLoading,
    error,
    fetchInvestments,
    fetchSummary,
    fetchProjections,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestments();

  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState('60'); // 5 anos em meses
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<any>(null);

  useEffect(() => {
    if (family) {
      fetchInvestments(family.id);
      fetchSummary(family.id);
      fetchProjections(family.id, parseInt(selectedTab));
    }
  }, [family]);

  useEffect(() => {
    if (family) {
      fetchProjections(family.id, parseInt(selectedTab));
    }
  }, [selectedTab, family]);

  const handleEditInvestment = (investment: any) => {
    setEditingInvestment(investment);
    setShowEditModal(true);
  };

  const handleDeleteInvestment = (investment: any) => {
    setDeletingInvestment(investment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteInvestment = async () => {
    if (!family || !deletingInvestment) return;
    
    try {
      await deleteInvestment(family.id, deletingInvestment.id);
      await fetchInvestments(family.id);
      await fetchSummary(family.id);
      await fetchProjections(family.id, parseInt(selectedTab));
      setShowDeleteConfirm(false);
      setDeletingInvestment(null);
      toast.success('Sucesso!', { description: 'Investimento excluído com sucesso' });
    } catch (err) {
      console.error('Failed to delete investment:', err);
      toast.error('Erro ao excluir investimento', { description: 'Não foi possível excluir o investimento' });
    }
  };

  if (!family) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Nenhuma família encontrada</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Erro ao carregar investimentos: {error}</p>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📈 Investimentos</h1>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#3B82F6] hover:bg-[#2563EB]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      {/* Patrimônio Total */}
      <Card className="bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💼</span>
          <p className="text-base">Patrimônio Total Investido</p>
        </div>
        <p className="text-5xl font-bold text-gray-900 mb-2">
          {formatMoney((summary?.total_balance || 0) * 100)}
        </p>
        <p className="text-sm text-gray-700">
          {investments.length} investimento{investments.length !== 1 ? 's' : ''} ativo{investments.length !== 1 ? 's' : ''}
          {summary?.total_monthly && summary.total_monthly > 0 && (
            <span className="ml-2">• Aporte mensal: {formatMoney((summary.total_monthly || 0) * 100)}</span>
          )}
        </p>
        <p className="text-xs text-green-700 mt-2">
          💡 Inclui aportes via despesas tipo "Investimento"
        </p>
      </Card>

      {/* Projeção de Crescimento */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">🔮 Projeção de Crescimento</h3>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { label: '1 ano', months: '12' },
            { label: '3 anos', months: '36' },
            { label: '5 anos', months: '60' },
          ].map((tab) => (
            <button
              key={tab.months}
              onClick={() => setSelectedTab(tab.months)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTab === tab.months
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gráfico */}
        {projections && projections.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={projections[0].projections.map((mp) => ({
                  month: mp.month,
                  value: mp.balance_cents / 100,
                }))}
              >
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  tickFormatter={(value) => `${value}m`}
                />
                <YAxis
                  stroke="#6B7280"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number | undefined) => value ? [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Patrimônio'] : ['R$ 0,00', 'Patrimônio']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#colorGrowth)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-gray-500 text-center py-10">Nenhuma projeção disponível</p>
        )}

        {/* Resultado */}
        {projections && projections.length > 0 && (
          <div className="bg-green-50 rounded-lg p-5 mt-6 border border-green-200">
            <p className="text-xl font-bold text-[#10B981] mb-2">
              💰 Em {parseInt(selectedTab) / 12} ano{parseInt(selectedTab) > 12 ? 's' : ''} você terá:{' '}
              {formatMoney(projections[0].projections[projections[0].projections.length - 1].balance_cents)}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              📈 Total investido: {formatMoney(projections[0].projections[projections[0].projections.length - 1].total_contributed_cents)}
            </p>
            <p className="text-sm text-[#10B981] font-medium">
              📈 Ganho líquido: {formatMoney(projections[0].projections[projections[0].projections.length - 1].total_returns_cents)}
            </p>
          </div>
        )}
      </Card>

      {/* Lista de Investimentos */}
      <Card className="p-6">
        <h3 className="text-xl mb-4">📋 Investimentos Ativos</h3>
        {investments && investments.length > 0 ? (
          <div className="space-y-3">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">
                    {getInvestmentTypeIcon(investment.type)}
                  </span>
                  <div>
                    <h4 className="font-bold">{investment.name}</h4>
                    <p className="text-sm text-gray-600">
                      {getInvestmentTypeName(investment.type)} • {investment.annual_return_rate}% a.a.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatMoney(investment.current_balance_cents)}</p>
                    <p className="text-sm text-gray-500">Aporte mensal: {formatMoney(investment.monthly_contribution_cents)}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      onClick={() => handleEditInvestment(investment)}
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteInvestment(investment)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">Nenhum investimento cadastrado</p>
        )}
      </Card>

      {/* Modal de Adicionar Investimento */}
      {showAddModal && (
        <AddInvestmentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false);
            if (family) {
              await fetchInvestments(family.id);
              await fetchSummary(family.id);
              await fetchProjections(family.id, parseInt(selectedTab));
            }
          }}
        />
      )}

      {/* Modal de Editar Investimento */}
      {showEditModal && editingInvestment && (
        <AddInvestmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingInvestment(null);
          }}
          investment={editingInvestment}
          onSuccess={async () => {
            setShowEditModal(false);
            setEditingInvestment(null);
            if (family) {
              await fetchInvestments(family.id);
              await fetchSummary(family.id);
              await fetchProjections(family.id, parseInt(selectedTab));
            }
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-gray-700">
              Tem certeza que deseja excluir o investimento{' '}
              <span className="font-semibold">"{deletingInvestment?.name}"</span>?
            </p>
            <p className="text-sm text-gray-500">
              Esta ação não pode ser desfeita e todos os dados do investimento serão perdidos.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingInvestment(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteInvestment}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ErrorBoundary>
  );
}
