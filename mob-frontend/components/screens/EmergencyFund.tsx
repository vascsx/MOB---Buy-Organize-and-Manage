import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { useEmergencyFund } from '../../hooks/useEmergencyFund';
import { useToast } from '../../hooks/useToast';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export function EmergencyFund() {
  const { 
    progress, 
    suggestion, 
    isLoading, 
    error, 
    fetchProgress, 
    fetchSuggestion,
    createOrUpdate,
    updateCurrentAmount,
    projection,
    fetchProjection
  } = useEmergencyFund();
  const { family } = useFamilyContext();
  const { toast } = useToast();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAddAmountModalOpen, setIsAddAmountModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(6);
  const [monthlyContribution, setMonthlyContribution] = useState(800);
  const [monthlyCost, setMonthlyCost] = useState(5000);
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    if (family) {
      fetchProgress(family.id);
      fetchSuggestion(family.id);
      fetchProjection(family.id, 6);
    }
  }, [family, fetchProgress, fetchSuggestion, fetchProjection]);

  useEffect(() => {
    if (family) {
      fetchProgress(family.id);
      fetchSuggestion(family.id);
    }
  }, [family, fetchProgress, fetchSuggestion]);

  useEffect(() => {
    if (progress) {
      setSelectedGoal(progress.target_months);
      setMonthlyContribution(progress.monthly_goal);
      setMonthlyCost(progress.monthly_expenses);
    }
  }, [progress]);

  const handleAddAmount = async () => {
    if (!family || !progress) return;
    const amount = parseFloat(amountToAdd.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      alert('Informe um valor válido');
      return;
    }
    try {
      const newTotal = progress.current_amount + amount;
      await updateCurrentAmount(family.id, newTotal);
      setAmountToAdd('');
      setIsAddAmountModalOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar valor:', err);
      toast.error('Erro ao adicionar valor', { description: 'Não foi possível adicionar o valor à reserva' });
    }
  };

  const handleSaveGoal = async () => {
    if (!family) return;
    try {
      await createOrUpdate(family.id, {
        target_months: selectedGoal,
        monthly_expenses: monthlyCost,
        monthly_goal: monthlyContribution / 100, // Enviar em reais
      });
      setIsAdjustModalOpen(false);
      await fetchProgress(family.id);
    } catch (err) {
      console.error('Erro ao salvar meta:', err);
      toast.error('Erro ao salvar meta', { description: 'Não foi possível salvar a meta de reserva' });
    }
  };

  const handleApplySuggestion = async () => {
    if (!family || !suggestion) return;
    try {
      await createOrUpdate(family.id, {
        target_months: 6, // padrão
        monthly_expenses: suggestion.total_expenses,
        monthly_goal: suggestion.suggested_amount,
      });
      await fetchProgress(family.id);
    } catch (err) {
      console.error('Erro ao aplicar sugestão:', err);
      toast.error('Erro ao aplicar sugestão', { description: 'Não foi possível aplicar a sugestão' });
    }
  };

  if (!family) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Nenhuma família encontrada</p>
      </div>
    );
  }

  if (isLoading && !progress) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Se não tem progress, mostrar tela de configuração inicial (mesmo com erro 404)
  if (!progress) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🚨 Reserva de Emergência</h1>
          <p className="text-gray-600 mt-1">Configure sua reserva de emergência</p>
        </div>
        
        <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure sua Reserva de Emergência</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Defina sua meta e comece a construir seu colchão financeiro para imprevistos
          </p>
          <Button 
            onClick={() => setIsAdjustModalOpen(true)}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          >
            Configurar Agora
          </Button>
        </div>

        {/* Modal de Ajustar Meta */}
        <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Meta</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div>
                <Label htmlFor="monthly-cost">Custo de Vida Mensal (R$)</Label>
                <Input
                  id="monthly-cost"
                  type="number"
                  value={monthlyCost}
                  onChange={(e) => setMonthlyCost(parseFloat(e.target.value))}
                  placeholder="5000"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Suas despesas mensais totais</p>
              </div>

              <div>
                <Label className="text-base font-medium">Quantos meses de despesas?</Label>
                <div className="mt-4">
                  <Slider
                    value={[selectedGoal]}
                    onValueChange={([value]) => setSelectedGoal(value)}
                    min={3}
                    max={12}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>3 meses</span>
                    <span className="font-bold text-lg text-[#3B82F6]">{selectedGoal} meses</span>
                    <span>12 meses</span>
                  </div>
                </div>
                {selectedGoal === 6 && (
                  <Badge className="mt-2 bg-green-100 text-[#10B981] hover:bg-green-100">
                    Recomendado por especialistas
                  </Badge>
                )}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Meta: R$ {isNaN(monthlyCost * selectedGoal) ? '0' : (monthlyCost * selectedGoal).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {selectedGoal} meses × R$ {isNaN(monthlyCost) ? '0' : monthlyCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="monthly-contribution">Contribuição Mensal (R$)</Label>
                <Input
                  id="monthly-contribution"
                  type="number"
                  value={monthlyContribution / 100}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) * 100)}
                  placeholder="800"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Quanto pretende guardar por mês</p>
              </div>

              <Button onClick={handleSaveGoal} className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">
                Salvar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Se tem erro mas já tem progress carregado, mostrar o erro mas manter a UI
  if (error) {
    console.error('Erro ao carregar dados:', error);
  }

  const currentAmount = progress.current_amount;
  const monthlyExpenses = progress.monthly_expenses;
  const goalAmount = progress.target_amount;
  const progressPercentage = progress.completion_percent;
  const remaining = progress.remaining_amount;
  const estimatedMonths = progress.estimated_months;

  // Monta os dados reais de evolução a partir da projeção
  const evolutionData = projection
    ? projection.projection.map((item, idx) => ({
        month: `${idx + 1}º mês`,
        value: item.balance,
      }))
    : [];

  const milestones = [
    { percentage: 25, label: '25%', emoji: '🏅', achieved: progressPercentage >= 25 },
    { percentage: 50, label: '50%', emoji: '🥈', achieved: progressPercentage >= 50 },
    { percentage: 75, label: '75%', emoji: '🥇', achieved: progressPercentage >= 75 },
    { percentage: 100, label: '100%', emoji: '🏆', achieved: progressPercentage >= 100 },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">🚨 Reserva de Emergência</h1>
          <p className="text-gray-600 mt-1">Seu colchão financeiro para imprevistos</p>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-3">🎯 Sua Meta</h3>
        <div className="flex items-center gap-3">
          <p className="text-2xl font-bold">{progress.target_months} meses de despesas</p>
          <Badge className="bg-green-100 text-[#10B981] hover:bg-green-100">
            {progress.target_months === 6 ? 'Recomendado' : 'Personalizado'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          (R$ {monthlyExpenses.toLocaleString()} × {progress.target_months} = R$ {goalAmount.toLocaleString()})
        </p>
      </div>

      {/* Barra de Progresso Gigante */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-5">📊 Progresso</h3>
        
        <div className="relative">
          <div className="w-full h-12 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] flex items-center justify-center transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="text-white font-bold text-sm">
                R$ {currentAmount.toLocaleString()} / R$ {goalAmount.toLocaleString()} (
                {progressPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-3xl font-bold">Faltam: R$ {remaining.toLocaleString()}</p>
          <p className="text-sm text-[#10B981]">
            {progressPercentage >= 25 && progressPercentage < 50 && 'Você já conquistou 1/4 da meta! 🎉'}
            {progressPercentage >= 50 && progressPercentage < 75 && 'Você já está na metade do caminho! 🎊'}
            {progressPercentage >= 75 && progressPercentage < 100 && 'Quase lá! Falta pouco! 🏆'}
            {progressPercentage >= 100 && 'Parabéns! Meta alcançada! 🎉🎉🎉'}
            {progressPercentage < 25 && 'Continue assim! Cada passo conta! 💪'}
          </p>
        </div>
      </div>

      {/* Tempo Estimado */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⏱️</span>
          <h3 className="text-xl font-bold">Quanto Tempo Falta?</h3>
        </div>
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            Com aporte de R$ {progress.monthly_goal.toLocaleString()}/mês:
          </p>
          {estimatedMonths > 0 ? (
            <>
              <p className="text-2xl font-bold text-[#3B82F6] mb-2">
                ➜ Você alcança a meta em {estimatedMonths} {estimatedMonths === 1 ? 'mês' : 'meses'}
              </p>
              <p className="text-gray-700">
                ➜ Estimativa:{' '}
                {new Date(new Date().setMonth(new Date().getMonth() + estimatedMonths)).toLocaleDateString(
                  'pt-BR',
                  { month: 'long', year: 'numeric' }
                )}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-[#10B981]">
              ✅ Meta já alcançada!
            </p>
          )}
        </div>
      </div>


      {/* Sugestão Inteligente */}
      {suggestion && suggestion.available_income > 0 && (
        <div className="bg-[#FEF3C7] rounded-lg p-6 border border-[#F59E0B]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3">Sugestão Inteligente</h3>
              <p className="text-sm text-gray-800 mb-2">
                Baseado na sua renda disponível (R$ {suggestion.available_income.toLocaleString()}/mês), 
                sugerimos aportar R$ {suggestion.suggested_amount.toLocaleString()}/mês
                ({suggestion.percentage_of_income.toFixed(0)}%).
              </p>
              <p className="text-sm text-gray-800 mb-4">
                Assim você atinge a meta mais rapidamente! 🎉
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleApplySuggestion}
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
                  disabled={isLoading}
                >
                  Aplicar sugestão
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAdjustModalOpen(true)}
                >
                  Personalizar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Evolução */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-5">📈 Evolução dos Últimos Meses</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={evolutionData}>
            <defs>
              <linearGradient id="colorEvolution" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis
              stroke="#6B7280"
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
              <Tooltip
                formatter={(value: number | undefined) => [`R$ ${value?.toLocaleString() ?? '0'}`, 'Reserva']}
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
              fill="url(#colorEvolution)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gamificação */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-5">🎯 Marcos de Progresso</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                milestone.achieved
                  ? 'border-[#10B981] bg-green-50'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <span className="text-4xl mb-2">{milestone.emoji}</span>
              <span className="font-bold text-lg">{milestone.label}</span>
              <span className="text-sm text-gray-600">
                {milestone.achieved ? 'Alcançado!' : 'Bloqueado'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Próximo objetivo: 50% (R$ {(goalAmount * 0.5).toLocaleString()})
        </p>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <Dialog open={isAddAmountModalOpen} onOpenChange={setIsAddAmountModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#10B981] hover:bg-[#059669] flex-1">
              Adicionar Valor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Valor à Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  Saldo atual: R$ {currentAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Valor a adicionar (R$)</Label>
                <Input
                  id="amount"
                  type="text"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddAmountModalOpen(false)} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddAmount}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              Ajustar Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Meta de Emergência</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  Suas despesas mensais: R$ {monthlyExpenses.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Escolha sua meta:</p>
                {[3, 6, 12].map((months) => (
                  <label
                    key={months}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="goal"
                      checked={selectedGoal === months}
                      onChange={() => setSelectedGoal(months)}
                      className="w-4 h-4"
                    />
                    <span>
                      {months} meses (R$ {(monthlyExpenses * months).toLocaleString()})
                    </span>
                  </label>
                ))}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Aporte mensal desejado:</span>
                  <span className="font-bold">R$ {monthlyContribution}</span>
                </div>
                <Slider
                  value={[monthlyContribution]}
                  onValueChange={(value) => setMonthlyContribution(value[0])}
                  min={0}
                  max={5000}
                  step={100}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-[#10B981] font-medium">
                  ➜ Tempo estimado: {Math.ceil((monthlyExpenses * selectedGoal) / monthlyContribution)}{' '}
                  meses
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdjustModalOpen(false)} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveGoal}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </ErrorBoundary>
  );
}
