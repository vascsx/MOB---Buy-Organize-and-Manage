import React, { useState, useEffect } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { Investment, InvestmentProjection } from '../types/finance.types';
import { investmentsAPI } from '../api/investments.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';

export const InvestmentsPage: React.FC = () => {
  const { selectedFamily } = useFamily();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [projection, setProjection] = useState<InvestmentProjection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedFamily) {
      loadInvestments();
    }
  }, [selectedFamily]);

  const loadInvestments = async () => {
    if (!selectedFamily) return;
    
    try {
      setIsLoading(true);
      const [investmentsData, projectionData] = await Promise.all([
        investmentsAPI.getAll(selectedFamily.id),
        investmentsAPI.getProjection(selectedFamily.id, 12) // 12 meses
      ]);
      setInvestments(investmentsData);
      setProjection(projectionData);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'tesouro_direto': '🏛️ Tesouro Direto',
      'cdb': '🏦 CDB',
      'lci_lca': '🏠 LCI/LCA',
      'acoes': '📈 Ações',
      'fundos': '💼 Fundos'
    };
    return labels[type] || type;
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  if (!selectedFamily) {
    return (
      <div className="p-6">
        <EmptyState
          icon="🏠"
          title="Nenhuma família selecionada"
          description="Selecione uma família para gerenciar os investimentos"
        />
      </div>
    );
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.current_balance_cents, 0);
  const totalMonthlyContribution = investments.reduce((sum, inv) => sum + inv.monthly_contribution_cents, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-gray-600 mt-1">Acompanhe o crescimento do patrimônio</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Novo Investimento'}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="💰 Total Investido">
          <MoneyDisplay amountCents={totalInvested} variant="large" color="success" />
        </Card>
        <Card title="📊 Aporte Mensal">
          <MoneyDisplay amountCents={totalMonthlyContribution} variant="large" />
        </Card>
        {projection && (
          <Card title="🎯 Projeção 12 Meses">
            <MoneyDisplay amountCents={projection.final_balance_cents} variant="large" color="success" />
            <p className="text-sm text-gray-600 mt-2">
              Ganho projetado: <MoneyDisplay amountCents={projection.total_earnings_cents} variant="small" color="success" />
            </p>
          </Card>
        )}
      </div>

      {/* Projeção Detalhada */}
      {projection && (
        <Card title="📈 Projeção de Crescimento">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Saldo Atual → Meta 12 meses</span>
                <span className="font-semibold">
                  {calculateProgress(projection.total_invested_cents, projection.final_balance_cents).toFixed(0)}%
                </span>
              </div>
              <ProgressBar
                current={projection.total_invested_cents}
                target={projection.final_balance_cents}
                color="success"
                size="lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total de Aportes</div>
                <MoneyDisplay amountCents={projection.total_invested_cents} variant="small" />
              </div>
              <div>
                <div className="text-gray-600">Rendimento Projetado</div>
                <MoneyDisplay amountCents={projection.total_earnings_cents} variant="small" color="success" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Investimentos */}
      {investments.length === 0 ? (
        <EmptyState
          icon="📈"
          title="Nenhum investimento cadastrado"
          description="Adicione seu primeiro investimento e acompanhe o crescimento"
          action={<Button variant="primary" onClick={() => setShowForm(true)}>+ Novo Investimento</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investments.map((investment) => (
            <Card
              key={investment.id}
              title={investment.description}
              subtitle={getInvestmentTypeLabel(investment.type)}
            >
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Saldo Atual</div>
                  <MoneyDisplay amountCents={investment.current_balance_cents} color="success" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Aporte Mensal</div>
                  <MoneyDisplay amountCents={investment.monthly_contribution_cents} variant="small" />
                </div>
                <div className="text-sm text-gray-600 pt-2 border-t">
                  Rentabilidade: {investment.annual_return_rate}% a.a.
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
