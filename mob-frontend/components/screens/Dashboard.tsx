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
        totalNet={(data.income.total_net || 0) * 100}  // converter reais para centavos
        totalGross={(data.income.total_gross || 0) * 100}
        totalTax={(data.income.total_tax || 0) * 100}
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
                amount={formatMoney((member.net || 0) * 100)}  // converter reais para centavos
                type={member.type?.toUpperCase() || 'N/A'}
                status="Ativo"
              />
            ))}
          </div>
        </section>
      )}

      {/* Grid 2 colunas para Resumo e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthSummary 
          totalNet={(data.income.total_net || 0) * 100}  // converter reais para centavos
          expenses={(data.expenses.total_monthly || 0) * 100}
          investments={(data.investments.total_monthly || 0) * 100}
          available={(data.available_income || 0) * 100}
        />
        <Alerts />
      </div>

      {/* Saúde Financeira */}
      <FinancialHealth 
        score={data.financial_health_score}
        expenseRatio={data.income.total_net > 0 ? (data.expenses.total_monthly / data.income.total_net) * 100 : 0}
        hasInvestments={data.investments && data.investments.total_monthly > 0}
        emergencyProgress={data.emergency_fund_progress?.completion_percent || 0}
        hasPositiveBalance={data.available_income > 0}
      />
    </div>
  );
}
