import React, { useState, useEffect } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { Income, IncomeSummary, IncomeType } from '../types/finance.types';
import { incomesAPI } from '../api/incomes.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

export const IncomesPage: React.FC = () => {
  const { selectedFamily } = useFamily();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedFamily) {
      loadIncomes();
    }
  }, [selectedFamily]);

  const loadIncomes = async () => {
    if (!selectedFamily) return;
    
    try {
      setIsLoading(true);
      const [incomesData, summaryData] = await Promise.all([
        incomesAPI.getAll(selectedFamily.id),
        incomesAPI.getSummary(selectedFamily.id)
      ]);
      setIncomes(incomesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIncomeTypeLabel = (type: IncomeType) => {
    return type === 'CLT' ? '👔 CLT' : '💼 PJ';
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
          description="Selecione uma família para gerenciar as receitas"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600 mt-1">Gerencie as fontes de renda da família</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Receita'}
        </Button>
      </div>

      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="💰 Renda Bruta Total">
            <MoneyDisplay amountCents={summary.total_gross_cents} variant="large" />
          </Card>
          <Card title="💸 Impostos Totais">
            <MoneyDisplay amountCents={summary.total_taxes_cents} variant="large" color="danger" />
          </Card>
          <Card title="✨ Renda Líquida Total">
            <MoneyDisplay amountCents={summary.total_net_cents} variant="large" color="success" />
          </Card>
        </div>
      )}

      {/* Lista de Receitas */}
      {incomes.length === 0 ? (
        <EmptyState
          icon="💰"
          title="Nenhuma receita cadastrada"
          description="Adicione a primeira fonte de renda da família"
          action={<Button variant="primary" onClick={() => setShowForm(true)}>+ Nova Receita</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomes.map((income) => (
            <Card
              key={income.id}
              title="Renda"
              subtitle={getIncomeTypeLabel(income.type)}
            >
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-sm">{income.is_active ? '✅ Ativa' : '❌ Inativa'}</div>
                </div>
                {income.type === 'PJ' && income.simples_rate && (
                  <div className="text-sm text-gray-600 pt-2 border-t">
                    Taxa Simples: {income.simples_rate}%
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
