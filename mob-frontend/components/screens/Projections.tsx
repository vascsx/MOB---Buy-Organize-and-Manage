import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { useInvestments } from '../../hooks/useInvestments';
import { useEmergencyFund } from '../../hooks/useEmergencyFund';
import { useDashboard } from '../../hooks/useDashboard';
import { useToast } from '../../hooks/useToast';
import { formatMoney } from '../../lib/utils/money';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export function Projections() {
  // Remover selectedFamily do contexto
  const { family } = useFamilyContext();
  const { data: dashboardData, fetchDashboard } = useDashboard();
  // Corrigir hooks para usar apenas investments e emergencyFund
  const { investments, projections: investmentProjections, fetchProjections: fetchInvestmentProjections } = useInvestments();
  const { projection: emergencyProjection, fetchProjection: fetchEmergencyProjection } = useEmergencyFund();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7).replace('-', '/'));
  
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYears, setSelectedYears] = useState(5);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenarioData, setScenarioData] = useState({
    incomeIncrease: { when: 'Jun/2027', amount: 2000 },
    newExpense: { when: 'Jan/2027', amount: 1500, description: 'Financiamento carro' },
    jobChange: { who: 'João Silva', when: 'Jun/2026', amount: 8000 }
  });

  const applyScenario = (scenarioType: string) => {
    let impactMessage = '';
    let projectedChange = 0;
    
    const currentBalance = (dashboardData?.income?.total_net || 0) - (dashboardData?.expenses?.total_monthly || 0);
    
    switch (scenarioType) {
      case 'income':
        const monthlyIncrease = scenarioData.incomeIncrease.amount;
        // Assume 70% goes to investments, compound over remaining years
        const monthlyInvestmentIncrease = monthlyIncrease * 0.7;
        const yearsRemaining = selectedYears - 2; // assuming change happens in year 2
        const monthsRemaining = yearsRemaining * 12;
        
        // Calculate compound growth of additional investment
        projectedChange = calculateInvestmentProjection(0, monthlyInvestmentIncrease, 0.10, monthsRemaining);
        impactMessage = `Novo patrimônio: ${formatMoney((totalPatrimony + projectedChange) * 100)} (+${formatMoney(projectedChange * 100)})`;
        break;
        
      case 'expense':
        const monthlyExpense = scenarioData.newExpense.amount;
        // This reduces available investment money
        const expenseYears = selectedYears - 2;
        const expenseMonths = expenseYears * 12;
        
        // Calculate lost opportunity cost (money that could have been invested)
        projectedChange = -calculateInvestmentProjection(0, monthlyExpense, 0.10, expenseMonths);
        impactMessage = `Novo patrimônio: ${formatMoney((totalPatrimony + projectedChange) * 100)} (${formatMoney(projectedChange * 100)})`;
        break;
        
      case 'job':
        const currentIncome = dashboardData?.income?.total_net || 0;
        const newIncome = scenarioData.jobChange.amount;
        const monthlyDiff = (newIncome - currentIncome) * 0.7; // considering taxes
        const jobChangeYears = selectedYears - 1;
        const jobChangeMonths = jobChangeYears * 12;
        
        // Calculate compound growth of additional investment capacity
        projectedChange = calculateInvestmentProjection(0, monthlyDiff * 0.7, 0.10, jobChangeMonths); // 70% to investments
        impactMessage = `Novo patrimônio: ${formatMoney((totalPatrimony + projectedChange) * 100)} (+${formatMoney(projectedChange * 100)})`;
        break;
    }
    
    toast.success('Cenário aplicado!', { description: impactMessage });
    
    // Add to scenarios list for tracking
    const newScenario = {
      id: Date.now(),
      type: scenarioType,
      data: scenarioData[scenarioType as keyof typeof scenarioData],
      impact: projectedChange,
      message: impactMessage
    };
    
    setScenarios(prev => [...prev, newScenario]);
  };

  const clearScenarios = () => {
    setScenarios([]);
    toast.success('Cenários limpos', { description: 'Voltando à projeção original' });
  };

  // Função para exportar relatório
  const exportReport = () => {
    const reportData = {
      date: new Date().toLocaleDateString('pt-BR'),
      family: family?.name || 'Família',
      month: selectedMonth,
      summary: {
        totalIncome: dashboardData?.income?.total_net || 0,
        totalExpenses: dashboardData?.expenses?.total_monthly || 0,
        balance: (dashboardData?.income?.total_net || 0) - (dashboardData?.expenses?.total_monthly || 0),
        emergencyFund: dashboardData?.emergency_fund?.current_amount || 0,
        totalInvestments: investments?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0,
        projectedGrowth: baseData.length > 0 ? (baseData[baseData.length - 1]?.total || 0) - (baseData[0]?.total || 0) : 0
      },
      scenarios: scenarios,
      risks: {
        emergencyFundRisk: dashboardData && dashboardData.emergency_fund && dashboardData.emergency_fund.current_amount > 0 && dashboardData.expenses?.total_monthly > 0
          ? Math.floor(dashboardData.emergency_fund.current_amount / dashboardData.expenses.total_monthly)
          : 0,
        investmentConcentration: investments && investments.length > 0
          ? (() => {
              const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
              const types = investments.reduce((acc: any, inv: any) => {
                acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
                return acc;
              }, {} as Record<string, number>);
              const largestPosition = Math.max(...(Object.values(types) as number[]));
              return largestPosition / totalInvested;
            })()
          : 0
      }
    };

    // Converter para JSON e baixar
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `relatorio_projecoes_${reportData.family}_${reportData.month.replace('/', '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Relatório exportado!', { 
      description: 'Download do arquivo JSON iniciado' 
    });
  };

  useEffect(() => {
    if (family) {
      fetchDashboard(family.id);
      fetchInvestmentProjections(family.id, selectedYears * 12);
      fetchEmergencyProjection(family.id, selectedYears * 12);
    }
  }, [family, selectedYears]);

  // Calculate realistic projections with compound interest
  const calculateInvestmentProjection = (currentAmount: number, monthlyContribution: number, annualReturn: number, months: number) => {
    let balance = currentAmount;
    const monthlyReturn = annualReturn / 12;
    
    for (let i = 0; i < months; i++) {
      // Apply monthly return
      balance = balance * (1 + monthlyReturn);
      // Add monthly contribution
      balance += monthlyContribution;
    }
    
    return balance;
  };

  const calculateEmergencyFundProjection = (currentAmount: number, monthlyContribution: number, months: number) => {
    // Emergency fund grows linearly (assuming low-risk savings)
    return currentAmount + (monthlyContribution * months);
  };

  // Prepare chart data with realistic compound interest calculations
  const baseData = React.useMemo(() => {
    if (!dashboardData) {
      // Fallback data while loading
      const currentYear = new Date().getFullYear();
      return Array.from({ length: selectedYears + 1 }, (_, index) => ({
        year: currentYear + index,
        reserve: 0,
        investments: 0,
        total: 0
      }));
    }

    const currentYear = new Date().getFullYear();
    const data = [];
    
    // Get current values
    const currentEmergencyAmount = dashboardData?.emergency_fund?.current_amount || 0;
    // Corrigir reduce com tipagem
    const currentInvestmentAmount = investments?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;
    
    // Estimate monthly contributions based on current income/expense balance
    const monthlyBalance = (dashboardData.income?.total_net || 0) - (dashboardData.expenses?.total_monthly || 0);
    const monthlyEmergencyContribution = Math.max(0, Math.min(monthlyBalance * 0.3, 1000)); // 30% to emergency, max 1000
    const monthlyInvestmentContribution = Math.max(0, monthlyBalance * 0.5); // 50% to investments
    
    // Assume 10% annual return for investments (conservative estimate)
    const annualInvestmentReturn = 0.10;
    
    for (let i = 0; i <= selectedYears; i++) {
      const year = currentYear + i;
      const monthsElapsed = i * 12;
      
      // Calculate emergency fund projection (linear growth)
      const emergencyAmount = calculateEmergencyFundProjection(
        currentEmergencyAmount,
        monthlyEmergencyContribution,
        monthsElapsed
      );
      
      // Calculate investment projection (compound growth)
      const investmentAmount = calculateInvestmentProjection(
        currentInvestmentAmount,
        monthlyInvestmentContribution,
        annualInvestmentReturn,
        monthsElapsed
      );
        
      data.push({
        year,
        reserve: emergencyAmount,
        investments: investmentAmount,
        total: emergencyAmount + investmentAmount
      });
    }
    
    return data;
  }, [dashboardData, investments, selectedYears]);

  const totalPatrimony = baseData.length > 0 ? baseData[baseData.length - 1].total : 0;

  const toggleScenario = (scenarioId: string) => {
    setExpandedScenario(expandedScenario === scenarioId ? null : scenarioId);
  };

  const handleYearChange = (years: number) => {
    setSelectedYears(years);
  };

  if (!family) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Nenhuma família encontrada</p>
      </div>
    );
  }

  const isDataLoading = !dashboardData;

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔮 Projeção Patrimonial</h1>
          <p className="text-gray-600 mt-1">Visualize seu futuro financeiro baseado em dados reais</p>
        </div>
        <select 
          className="px-4 py-2 border rounded-lg bg-white"
          value={selectedYears}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
        >
          <option value={3}>3 anos</option>
          <option value={5}>5 anos</option>
          <option value={10}>10 anos</option>
          <option value={15}>15 anos</option>
        </select>
      </div>

      {/* Resultado Futuro */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] rounded-lg p-8 shadow-lg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          {isDataLoading ? (
            <div className="flex items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin" />
              <div>
                <p className="text-base opacity-80 mb-2">Calculando sua projeção...</p>
                <p className="text-3xl font-bold">Aguarde</p>
              </div>
            </div>
          ) : (
            <>
              <span className="text-5xl mb-3 block">💰</span>
              <p className="text-base opacity-80 mb-2">Seu Patrimônio em {baseData[baseData.length - 1]?.year || new Date().getFullYear() + selectedYears}</p>
              <p className="text-6xl font-bold mb-3">{formatMoney(Math.round(totalPatrimony * 100))}</p>
              <p className="text-sm opacity-60">Projeção baseada em dados reais</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="opacity-80">🟢 Reserva</p>
                  <p className="font-bold">{formatMoney(Math.round((baseData[baseData.length - 1]?.reserve || 0) * 100))}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="opacity-80">🔵 Investimentos</p>
                  <p className="font-bold">{formatMoney(Math.round((baseData[baseData.length - 1]?.investments || 0) * 100))}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6">📊 Evolução Patrimonial</h3>
        
        {/* Assumptions info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>💡 Premissas:</strong> Rentabilidade de 10% a.a. para investimentos • 
            {((dashboardData?.income?.total_net || 0) - (dashboardData?.expenses?.total_monthly || 0)) > 0 ? 
              ` Aporte estimado: ${formatMoney(Math.max(0, ((dashboardData?.income?.total_net || 0) - (dashboardData?.expenses?.total_monthly || 0)) * 0.5) * 100)}/mês em investimentos` :
              ' Configure renda e gastos para ver aportes estimados'
            }
          </p>
        </div>
        
        {isDataLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Carregando projeções...</p>
            </div>
          </div>
        ) : baseData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={baseData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorReserve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="year" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number | undefined, name?: string) => [
                    formatMoney((value || 0) * 100),
                    name === 'reserve' ? 'Reserva de Emergência' : name === 'investments' ? 'Investimentos' : 'Total',
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  formatter={(value: string) => (value === 'reserve' ? '🟢 Reserva de Emergência' : '🔵 Investimentos')}
                />
                <Area
                  type="monotone"
                  dataKey="reserve"
                  stackId="1"
                  stroke="#10B981"
                  fill="url(#colorReserve)"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="investments"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="url(#colorInvestments)"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 mb-2">🟢 Crescimento da Reserva</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatMoney(((baseData[baseData.length - 1]?.reserve || 0) - (baseData[0]?.reserve || 0)) * 100)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  nos próximos {selectedYears} anos
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 mb-2">🔵 Crescimento dos Investimentos</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatMoney(((baseData[baseData.length - 1]?.investments || 0) - (baseData[baseData.length - 1]?.investments || 0)) * 100)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  nos próximos {selectedYears} anos
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700 mb-2">📊 Crescimento Total</p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatMoney(((baseData[baseData.length - 1]?.total || 0) - (baseData[0]?.total || 0)) * 100)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  crescimento patrimonial
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">Sem dados suficientes</h4>
            <p className="text-gray-500">Configure seus investimentos e reserva para ver projeções</p>
          </div>
        )}
      </div>

      {/* Simulador de Cenários */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-2">🧪 Simular Cenários</h3>
        <p className="text-sm text-gray-600 mb-5">Teste diferentes situações e veja o impacto</p>

        <div className="space-y-3">
          {/* Cenário 1: Aumento de Renda */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleScenario('income')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold">📈 Aumento de renda</span>
              {expandedScenario === 'income' ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedScenario === 'income' && (
              <div className="p-4 border-t bg-gray-50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quando?</Label>
                    <select className="w-full px-3 py-2 border rounded-lg mt-1">
                      <option>Dez/2026</option>
                      <option>Jan/2027</option>
                      <option>Jun/2027</option>
                    </select>
                  </div>
                  <div>
                    <Label>Aumento</Label>
                    <Input 
                      type="text" 
                      placeholder="+R$ 2.000/mês" 
                      value={scenarioData.incomeIncrease.amount}
                      onChange={(e) => setScenarioData(prev => ({
                        ...prev,
                        incomeIncrease: { ...prev.incomeIncrease, amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="mt-1" 
                    />
                  </div>
                </div>
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={() => applyScenario('income')}
                  disabled={isLoading}
                >
                  Aplicar
                </Button>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="font-bold text-[#10B981]">
                    ➜ Impacto estimado: +{formatMoney(calculateInvestmentProjection(0, scenarioData.incomeIncrease.amount * 0.7, 0.10, (selectedYears - 2) * 12) * 100)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Considerando 70% direcionado a investimentos com rentabilidade de 10% a.a.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cenário 2: Nova Despesa */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleScenario('expense')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold">📉 Nova despesa</span>
              {expandedScenario === 'expense' ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedScenario === 'expense' && (
              <div className="p-4 border-t bg-gray-50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quando?</Label>
                    <select className="w-full px-3 py-2 border rounded-lg mt-1">
                      <option>Jan/2027</option>
                      <option>Jun/2027</option>
                      <option>Dez/2027</option>
                    </select>
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input 
                      type="text" 
                      placeholder="R$ 1.500/mês" 
                      value={scenarioData.newExpense.amount}
                      onChange={(e) => setScenarioData(prev => ({
                        ...prev,
                        newExpense: { ...prev.newExpense, amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="mt-1" 
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input 
                    type="text" 
                    placeholder="Ex: Financiamento carro" 
                    value={scenarioData.newExpense.description}
                    onChange={(e) => setScenarioData(prev => ({
                      ...prev,
                      newExpense: { ...prev.newExpense, description: e.target.value }
                    }))}
                    className="mt-1" 
                  />
                </div>
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={() => applyScenario('expense')}
                  disabled={isLoading}
                >
                  Aplicar
                </Button>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="font-bold text-[#EF4444]">
                    ➜ Impacto estimado: {formatMoney(-calculateInvestmentProjection(0, scenarioData.newExpense.amount, 0.10, (selectedYears - 2) * 12) * 100)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Custo de oportunidade (valor que poderia ser investido)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cenário 3: Mudança CLT → PJ */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleScenario('job')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold">🔄 Mudança CLT → PJ</span>
              {expandedScenario === 'job' ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedScenario === 'job' && (
              <div className="p-4 border-t bg-gray-50 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Quem?</Label>
                    <select className="w-full px-3 py-2 border rounded-lg mt-1">
                      <option>João Silva</option>
                      <option>Maria Silva</option>
                    </select>
                  </div>
                  <div>
                    <Label>Quando?</Label>
                    <select className="w-full px-3 py-2 border rounded-lg mt-1">
                      <option>Jun/2026</option>
                      <option>Jan/2027</option>
                      <option>Jun/2027</option>
                    </select>
                  </div>
                  <div>
                    <Label>Novo valor</Label>
                    <Input 
                      type="text" 
                      placeholder="R$ 8.000/mês" 
                      value={scenarioData.jobChange.amount}
                      onChange={(e) => setScenarioData(prev => ({
                        ...prev,
                        jobChange: { ...prev.jobChange, amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="mt-1" 
                    />
                  </div>
                </div>
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={() => applyScenario('job')}
                  disabled={isLoading}
                >
                  Aplicar
                </Button>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-bold text-[#3B82F6]">
                    ➜ Impacto estimado: +{formatMoney((() => {
                      const currentIncome = dashboardData?.income?.total_net || 0;
                      const monthlyDiff = (scenarioData.jobChange.amount - currentIncome) * 0.7 * 0.7; // taxes + investment allocation
                      return calculateInvestmentProjection(0, monthlyDiff, 0.10, (selectedYears - 1) * 12) * 100;
                    })())}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Diferença líquida investida com rentabilidade de 10% a.a.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4">
          + Adicionar cenário
        </Button>

        {/* Cenários Aplicados */}
        {scenarios.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">📋 Cenários Aplicados</h4>
            <div className="space-y-2">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <p className="font-medium text-sm">
                      {scenario.type === 'income' && '📈 Aumento de renda'}
                      {scenario.type === 'expense' && '📉 Nova despesa'}
                      {scenario.type === 'job' && '🔄 Mudança CLT → PJ'}
                    </p>
                    <p className="text-xs text-gray-600">{scenario.message}</p>
                  </div>
                  <button
                    onClick={() => setScenarios(prev => prev.filter(s => s.id !== scenario.id))}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Análise de Riscos */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h3 className="text-lg font-bold mb-4 text-red-800">⚠️ Análise de Riscos</h3>
        <div className="space-y-4">
          {/* Risco de Emergency Fund */}
          <div className="p-4 bg-white rounded-lg border border-red-100">
            <h4 className="font-bold text-red-700 mb-2">📊 Reserva de Emergência</h4>
            {dashboardData && dashboardData.emergency_fund && dashboardData.emergency_fund.current_amount > 0 && dashboardData.expenses?.total_monthly > 0 ? (
              (() => {
                const fund = dashboardData.emergency_fund;
                const monthsOfProtection = fund.current_amount > 0 && dashboardData.expenses?.total_monthly > 0
                  ? Math.floor(fund.current_amount / dashboardData.expenses.total_monthly)
                  : 0;
                
                const riskLevel = monthsOfProtection >= 6 ? 'baixo' : 
                                 monthsOfProtection >= 3 ? 'médio' : 'alto';
                const riskColor = riskLevel === 'baixo' ? 'text-green-600' : 
                                 riskLevel === 'médio' ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <div>
                    <p className="text-sm mb-2">
                      Cobertura atual: <span className={`font-bold ${riskColor}`}>
                        {monthsOfProtection} meses
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Risco: <span className={`font-bold ${riskColor}`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    </p>
                    {monthsOfProtection < 6 && (
                      <p className="text-xs text-red-600 mt-1">
                        Recomenda-se pelo menos 6 meses de proteção
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-red-600">
                Nenhuma reserva de emergência encontrada. <strong>Risco muito alto!</strong>
              </p>
            )}
          </div>

          {/* Risco de Concentração de Investimentos */}
          <div className="p-4 bg-white rounded-lg border border-red-100">
            <h4 className="font-bold text-red-700 mb-2">🎯 Diversificação de Investimentos</h4>
            {investments && investments.length > 0 ? (
              (() => {
                const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
                const types = investments.reduce((acc: any, inv: any) => {
                  acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
                  return acc;
                }, {} as Record<string, number>);
                
                const largestPosition = Math.max(...(Object.values(types) as number[]));
                const concentrationRisk = largestPosition / totalInvested;
                
                const riskLevel = concentrationRisk > 0.7 ? 'alto' : 
                                 concentrationRisk > 0.5 ? 'médio' : 'baixo';
                const riskColor = riskLevel === 'baixo' ? 'text-green-600' : 
                                 riskLevel === 'médio' ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <div>
                    <p className="text-sm mb-2">
                      Concentração máxima: <span className={`font-bold ${riskColor}`}>
                        {(concentrationRisk * 100).toFixed(1)}%
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Risco de concentração: <span className={`font-bold ${riskColor}`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    </p>
                    {concentrationRisk > 0.5 && (
                      <p className="text-xs text-red-600 mt-1">
                        Considere diversificar mais sua carteira
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-red-600">
                Nenhum investimento encontrado. <strong>Oportunidade perdida!</strong>
              </p>
            )}
          </div>

          {/* Risco de Renda */}
          <div className="p-4 bg-white rounded-lg border border-red-100">
            <h4 className="font-bold text-red-700 mb-2">💰 Estabilidade de Renda</h4>
            {dashboardData && dashboardData.income?.total_net > 0 ? (
              (() => {
                // Simular análise de estabilidade baseada na fonte de renda
                const hasMultipleSources = dashboardData.income?.members && dashboardData.income.members.length > 1;
                
                const riskLevel = hasMultipleSources ? 'baixo' : 'médio';
                const riskColor = riskLevel === 'baixo' ? 'text-green-600' : 'text-yellow-600';
                
                return (
                  <div>
                    <p className="text-sm mb-2">
                      Fontes de renda: <span className={`font-bold ${riskColor}`}>
                        {hasMultipleSources ? 'Diversificadas' : 'Concentrada'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Risco: <span className={`font-bold ${riskColor}`}>
                        {riskLevel.toUpperCase()}
                      </span>
                    </p>
                    {!hasMultipleSources && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Considere desenvolver fontes alternativas de renda
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-red-600">
                Nenhuma renda registrada. <strong>Situação crítica!</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={clearScenarios}
          disabled={scenarios.length === 0}
        >
          Limpar cenários {scenarios.length > 0 && `(${scenarios.length})`}
        </Button>
        <div className="flex-1 relative">
          <Button 
            className="bg-[#3B82F6] hover:bg-[#2563EB] w-full"
            onClick={exportReport}
            disabled={isLoading}
          >
            📊 Exportar relatório
          </Button>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
