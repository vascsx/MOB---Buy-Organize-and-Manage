import React, { useEffect } from 'react';
import { useDashboard } from '../../hooks';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { formatMoney } from '../../lib/utils/money';
import { IncomeCard } from '../IncomeCard';
import { PersonCard } from '../PersonCard';
import { MonthSummary } from '../MonthSummary';
import { Alerts } from '../Alerts';
import { FinancialHealth } from '../FinancialHealth';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Card } from '../ui/card';

export function Dashboard() {
  const { family } = useFamilyContext();
  const { data, isLoading, error, fetchDashboard } = useDashboard();

  useEffect(() => {
    if (family) {
      fetchDashboard(family.id);
    }
  }, [family, fetchDashboard]);

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

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Card - Renda Líquida */}
      <IncomeCard 
        totalNet={data.income.total_net}
        totalGross={data.income.total_gross}
        totalTax={data.income.total_tax}
      />

      {/* Por Pessoa - Grid 2 colunas */}
      {data.income.members && data.income.members.length > 0 && (
        <section>
          <h2 className="text-xl mb-4">Por Pessoa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.income.members.map((member: any) => (
              <PersonCard
                key={member.member_id}
                name={member.member_name}
                amount={formatMoney(member.net_monthly_cents || 0)}
                type={member.type?.toUpperCase() || 'N/A'}
                status={member.is_active ? 'Ativo' : 'Inativo'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Grid 2 colunas para Resumo e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthSummary 
          totalNet={data.income.total_net}
          expenses={data.expenses.total_monthly}
          investments={data.investments.total_monthly}
          available={data.available_income}
        />
        <Alerts />
      </div>

      {/* Saúde Financeira */}
      <FinancialHealth score={data.financial_health_score} />
    </div>
  );
}
