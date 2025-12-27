import React from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';

export const DashboardPage: React.FC = () => {
  const { selectedFamily, isLoading } = useFamily();

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
          description="Crie sua primeira família para começar a organizar suas finanças"
          action={<Button variant="primary">Criar Família</Button>}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">{selectedFamily.name}</p>
      </div>

      {/* Renda Líquida da Família */}
      <Card title="💰 Renda Líquida da Família">
        <MoneyDisplay
          amountCents={1337250}
          variant="large"
          gross={1500000}
        />
        <p className="text-sm text-gray-600 mt-2">
          R$ 1.627,50 em impostos descontados
        </p>
      </Card>

      {/* Cards de Membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="João Silva" subtitle="CLT">
          <MoneyDisplay amountCents={449821} />
        </Card>
        <Card title="Maria Silva" subtitle="PJ">
          <MoneyDisplay amountCents={887429} />
        </Card>
      </div>

      {/* Resumo do Mês */}
      <Card title="📊 Resumo do Mês">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>💸 Despesas</span>
            <MoneyDisplay amountCents={937250} variant="small" />
          </div>
          <div className="flex justify-between items-center">
            <span>📈 Investimentos</span>
            <MoneyDisplay amountCents={250000} variant="small" />
          </div>
          <div className="flex justify-between items-center">
            <span>🎯 Reserva</span>
            <MoneyDisplay amountCents={80000} variant="small" />
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="font-semibold">🎉 Sobrou</span>
            <MoneyDisplay amountCents={70000} variant="default" color="success" />
          </div>
        </div>
      </Card>

      {/* Saúde Financeira */}
      <Card title="🎯 Saúde Financeira">
        <div className="mb-4">
          <span className="text-4xl font-bold text-blue-600">72</span>
          <span className="text-gray-600">/100</span>
          <span className="ml-3 text-lg text-gray-700">(Bom)</span>
        </div>
        <div className="space-y-2 text-sm">
          <p>✅ Despesas controladas</p>
          <p>⚠️ Reserva de emergência: apenas 25% da meta</p>
          <p>✅ Investimentos: bom ritmo</p>
        </div>
      </Card>
    </div>
  );
};
