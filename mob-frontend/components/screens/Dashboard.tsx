import { useEffect } from 'react';
import { useFamilies, useDashboard } from '../../hooks';
import { formatMoney } from '../../lib/utils/money';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';

export function Dashboard() {
  const { currentFamily } = useFamilies();
  const { data, isLoading, error, fetchDashboard } = useDashboard();

  useEffect(() => {
    if (currentFamily) {
      fetchDashboard(currentFamily.id);
    }
  }, [currentFamily, fetchDashboard]);

  if (!currentFamily) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Selecione uma família para visualizar o dashboard</p>
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
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8">
        <p className="text-sm opacity-90 mb-2">💰 Renda Líquida da Família</p>
        <h2 className="text-4xl font-bold mb-2">
          {formatMoney(data.income_summary.total_net)} / mês
        </h2>
        <p className="text-sm opacity-80">
          ({formatMoney(data.income_summary.total_gross)} bruto -{' '}
          {formatMoney(data.income_summary.total_inss + data.income_summary.total_irpf)} impostos)
        </p>
      </Card>

      {/* Por Pessoa - Grid 2 colunas */}
      <section>
        <h2 className="text-xl font-semibold mb-4">👥 Por Pessoa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.income_summary.member_incomes.map((member) => (
            <Card key={member.member_id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{member.member_name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {member.type.toUpperCase()}
                  </Badge>
                </div>
                {member.is_active && (
                  <Badge className="bg-green-500">✅ Ativo</Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatMoney(member.net_monthly_cents)}
              </p>
              <p className="text-sm text-gray-600">
                Bruto: {formatMoney(member.gross_monthly_cents)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Resumo do Mês */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">📊 Resumo do Mês</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">💸 Despesas</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {formatMoney(data.expenses_summary.total_monthly)}
              </span>
              <span className="text-sm text-gray-500">
                ({((data.expenses_summary.total_monthly / data.income_summary.total_net) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          
          {data.investments_summary && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">📈 Investimentos</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {formatMoney(data.investments_summary.total_monthly)}
                </span>
                <span className="text-sm text-gray-500">
                  ({((data.investments_summary.total_monthly / data.income_summary.total_net) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-gray-700 font-medium">🎉 Sobrou</span>
            <span className="font-bold text-green-600">
              {formatMoney(data.available_income)}
            </span>
          </div>
        </div>
      </Card>

      {/* Alertas */}
      {data.alerts && data.alerts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">⚠️ Alertas</h3>
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <Alert 
                key={index}
                variant={alert.type === 'success' ? 'default' : alert.type === 'warning' ? 'destructive' : 'default'}
              >
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Saúde Financeira */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">🎯 Saúde Financeira</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-bold text-blue-600">
            {data.financial_health_score}
          </div>
          <div className="text-2xl text-gray-600">/100</div>
          <Badge className="ml-auto" variant={
            data.financial_health_score >= 80 ? 'default' :
            data.financial_health_score >= 60 ? 'secondary' : 'destructive'
          }>
            {data.financial_health_score >= 80 ? 'Excelente' :
             data.financial_health_score >= 60 ? 'Bom' : 'Precisa melhorar'}
          </Badge>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
            style={{ width: `${data.financial_health_score}%` }}
          />
        </div>
      </Card>

    </div>
  );
}
