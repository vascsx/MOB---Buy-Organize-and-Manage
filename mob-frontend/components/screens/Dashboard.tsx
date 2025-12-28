import React, { useEffect } from 'react';
import type { Alert as AlertType } from '../../lib/types/api.types';
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
import { ErrorBoundary } from '../ui/ErrorBoundary';

export function Dashboard() {
  const { family } = useFamilyContext();
  const { data, isLoading, error, fetchDashboard } = useDashboard();

  useEffect(() => {
    if (family) {
      fetchDashboard(family.id);
    }
  }, [family, fetchDashboard]);


  // Suporte para emergency_fund_progress ou emergency_fund
  let emergencyFundProgress = undefined;
  let filteredAlerts: AlertType[] = [];
  if (data) {
    emergencyFundProgress = data.emergency_fund_progress || data.emergency_fund;

    // Lógica para filtrar alertas conforme alertSettings do localStorage
    type AlertSettings = {
      highExpenses: boolean;
      emergencyFund: boolean;
      investment: boolean;
      savingsGoal: boolean;
      incomeVariation: boolean;
    };
    const defaultSettings: AlertSettings = {
      highExpenses: true,
      emergencyFund: true,
      investment: true,
      savingsGoal: true,
      incomeVariation: true,
    };
    let alertSettings: AlertSettings = defaultSettings;
    try {
      const saved = localStorage.getItem('alertSettings');
      if (saved) {
        alertSettings = { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {}

    const alertTypeMap: Record<string, keyof AlertSettings> = {
      high_expenses: 'highExpenses',
      emergency_fund: 'emergencyFund',
      investment: 'investment',
      savings_goal: 'savingsGoal',
      income_variation: 'incomeVariation',
    };

    filteredAlerts = (data.alerts || []).filter((alert: AlertType) => {
      const cat = (alert as any).category as string | undefined;
      const typ = (alert as any).type as string | undefined;
      const key = (cat && alertTypeMap[cat]) || (typ && alertTypeMap[typ]) || null;
      if (!key) return true;
      return alertSettings[key] !== false;
    });
  }

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
      <ErrorBoundary>
        <IncomeCard 
          totalNet={(data.income.total_net || 0) * 100}  // converter reais para centavos
          totalGross={(data.income.total_gross || 0) * 100}
          totalTax={(data.income.total_tax || 0) * 100}
        />
      </ErrorBoundary>

      {/* Por Pessoa - Grid 2 colunas */}
      {data.income.members && data.income.members.length > 0 && (
        <section>
          <h2 className="text-xl mb-4">Por Pessoa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.income.members.map((member: any) => (
              <ErrorBoundary key={member.member_id}>
                <PersonCard
                  name={member.member_name}
                  amount={formatMoney((member.net || 0) * 100)}  // converter reais para centavos
                  type={member.type?.toUpperCase() || 'N/A'}
                  status="Ativo"
                />
              </ErrorBoundary>
            ))}
          </div>
        </section>
      )}

      {/* Grid 2 colunas para Resumo e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <MonthSummary 
            totalNet={(data.income.total_net || 0) * 100}  // converter reais para centavos
            expenses={(data.expenses.total_monthly || 0) * 100}
            investments={(data.investments.total_monthly || 0) * 100}
            available={(data.available_income || 0) * 100}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <Alerts alerts={filteredAlerts} />
        </ErrorBoundary>
      </div>

      {/* Saúde Financeira */}
      <ErrorBoundary>
        <FinancialHealth 
          score={data.financial_health_score}
          expenseRatio={data.income.total_net > 0 ? (data.expenses.total_monthly / data.income.total_net) * 100 : 0}
          hasInvestments={data.investments && data.investments.total_monthly > 0}
          emergencyProgress={emergencyFundProgress?.completion_percent || 0}
          hasPositiveBalance={data.available_income > 0}
        />
      </ErrorBoundary>
    </div>
  );
}
