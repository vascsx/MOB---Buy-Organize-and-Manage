import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInvestments } from '../../hooks';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { formatMoney } from '../../lib/utils/money';
import { getInvestmentTypeIcon, getInvestmentTypeName } from '../../lib/utils/investment';
import { AddInvestmentModal } from '../AddInvestmentModal';

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
  } = useInvestments();

  const [selectedTab, setSelectedTab] = useState('60'); // 5 anos em meses
  const [showAddModal, setShowAddModal] = useState(false);

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
                data={projections.flatMap(p => 
                  p.monthly_projections.map(mp => ({
                    month: mp.month,
                    value: mp.amount_cents / 100,
                  }))
                )}
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
              {formatMoney(projections[projections.length - 1].final_amount_cents)}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              📈 Total investido: {formatMoney(projections[projections.length - 1].total_invested_cents)}
            </p>
            <p className="text-sm text-[#10B981] font-medium">
              📈 Ganho líquido: {formatMoney(projections[projections.length - 1].total_return_cents)}
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
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
    </div>
  );
}
