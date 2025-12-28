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
      toast.success('Sugestão aplicada!', { 
        description: `Nova meta definida: R$ ${suggestion.suggested_amount.toLocaleString()}/mês` 
      });
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
  const evolutionData = projection && projection.projection && projection.projection.length > 0
    ? projection.projection.map((item, idx) => ({
        month: `${idx + 1}º mês`,
        value: item.balance,
      }))
    : [
        { month: '1º mês', value: currentAmount },
        { month: '2º mês', value: currentAmount + progress.monthly_goal },
        { month: '3º mês', value: currentAmount + (progress.monthly_goal * 2) },
        { month: '4º mês', value: currentAmount + (progress.monthly_goal * 3) },
        { month: '5º mês', value: currentAmount + (progress.monthly_goal * 4) },
        { month: '6º mês', value: Math.min(currentAmount + (progress.monthly_goal * 5), goalAmount) },
      ];

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
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-3 rounded-full border border-red-100 mb-4">
            <span className="text-2xl">🚨</span>
            <h1 className="text-2xl font-bold text-gray-900">Reserva de Emergência</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">Construa seu colchão financeiro para enfrentar imprevistos com tranquilidade</p>
        </div>

        {/* Meta */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Sua Meta</h3>
              <p className="text-blue-600 text-sm">Proteção para {progress.target_months} meses</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{progress.target_months}</p>
              <p className="text-sm text-gray-600">meses de proteção</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">R$ {monthlyExpenses.toLocaleString()}</p>
              <p className="text-sm text-gray-600">custo mensal</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">R$ {goalAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">meta total</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Badge className={`${
              progress.target_months === 6 
                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
            }`}>
              {progress.target_months === 6 ? '✨ Recomendado por especialistas' : '🎨 Meta personalizada'}
            </Badge>
          </div>
        </div>

      {/* Barra de Progresso Gigante */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Seu Progresso</h3>
            <p className="text-gray-600 text-sm">{progressPercentage.toFixed(1)}% da sua meta alcançada</p>
          </div>
        </div>
        
        <div className="relative mb-6">
          <div className="w-full h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 flex items-center justify-end pr-6 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(progressPercentage, 8)}%` }}
            >
              <span className="text-white font-bold text-lg drop-shadow-sm">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 mb-2">💰 Valor Atual</p>
            <p className="text-4xl font-bold text-green-800">R$ {currentAmount.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-700 mb-2">🎯 Ainda Falta</p>
            <p className="text-4xl font-bold text-orange-800">R$ {remaining.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <p className="text-lg font-medium text-gray-800 mb-2">
            {progressPercentage >= 100 && '🎉 Parabéns! Sua reserva está completa!'}
            {progressPercentage >= 75 && progressPercentage < 100 && '🏆 Quase lá! Você está na reta final!'}
            {progressPercentage >= 50 && progressPercentage < 75 && '🎊 Excelente! Você já passou da metade!'}
            {progressPercentage >= 25 && progressPercentage < 50 && '🎉 Parabéns! Primeiro marco alcançado!'}
            {progressPercentage < 25 && '💪 Cada real conta! Continue construindo seu futuro!'}
          </p>
          <p className="text-sm text-gray-600">
            De R$ {goalAmount.toLocaleString()}, você já conquistou R$ {currentAmount.toLocaleString()}
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
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-8 border-2 border-amber-200 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center transform -rotate-6 shadow-lg">
              <span className="text-3xl">💡</span>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🤖 Sugestão Inteligente</h3>
                <p className="text-amber-800 font-medium">
                  Nossa IA analisou suas finanças e tem uma recomendação especial!
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-white/50 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-100 rounded-xl">
                    <p className="text-sm text-green-700 mb-1">💵 Renda Disponível</p>
                    <p className="text-xl font-bold text-green-800">R$ {suggestion.available_income.toLocaleString()}/mês</p>
                  </div>
                  <div className="text-center p-4 bg-blue-100 rounded-xl">
                    <p className="text-sm text-blue-700 mb-1">🎯 Sugestão</p>
                    <p className="text-xl font-bold text-blue-800">R$ {suggestion.suggested_amount.toLocaleString()}/mês</p>
                  </div>
                  <div className="text-center p-4 bg-purple-100 rounded-xl">
                    <p className="text-sm text-purple-700 mb-1">📊 Percentual</p>
                    <p className="text-xl font-bold text-purple-800">{suggestion.percentage_of_income.toFixed(0)}%</p>
                  </div>
                </div>
                
                <p className="text-center text-gray-700 font-medium">
                  ✨ Com esse valor, você alcançará sua meta mais rapidamente!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleApplySuggestion}
                  className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg shadow-lg"
                  disabled={isLoading}
                >
                  <span className="mr-2">✨</span>
                  Aplicar Sugestão
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAdjustModalOpen(true)}
                  className="flex-1 h-14 border-2 border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold"
                >
                  <span className="mr-2">🎨</span>
                  Personalizar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Evolução */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 shadow-sm border border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Projeção de Evolução</h3>
            <p className="text-blue-600 text-sm">Como sua reserva crescerá nos próximos meses</p>
          </div>
        </div>
        
        {evolutionData && evolutionData.length > 0 ? (
          <>
            <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-white/50">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorEvolution" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="month" 
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
                    formatter={(value: number | undefined) => [`R$ ${value?.toLocaleString('pt-BR') ?? '0'}`, 'Reserva']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorEvolution)"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3B82F6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-xl border border-white/30">
                <p className="text-sm text-gray-600 mb-1">📊 Valor Inicial</p>
                <p className="text-lg font-bold text-blue-700">R$ {evolutionData[0]?.value?.toLocaleString('pt-BR') ?? '0'}</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-xl border border-white/30">
                <p className="text-sm text-gray-600 mb-1">🎯 Projetado em 6 meses</p>
                <p className="text-lg font-bold text-purple-700">R$ {evolutionData[evolutionData.length - 1]?.value?.toLocaleString('pt-BR') ?? '0'}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white/50 rounded-xl border border-white/30">
            <div className="text-6xl mb-4">📊</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">Dados em carregamento</h4>
            <p className="text-gray-500">Aguarde enquanto calculamos sua projeção...</p>
          </div>
        )}
      </div>

      {/* Gamificação */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-3 rounded-full border border-yellow-200 mb-4">
            <span className="text-2xl">🏆</span>
            <h3 className="text-xl font-bold text-gray-900">Marcos de Progresso</h3>
          </div>
          <p className="text-gray-600">Celebre cada conquista no seu caminho!</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`relative group transform transition-all duration-300 hover:scale-105 ${
                milestone.achieved ? 'animate-pulse' : ''
              }`}
            >
              <div
                className={`flex flex-col items-center p-6 rounded-2xl border-3 transition-all duration-300 ${
                  milestone.achieved
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className={`text-6xl mb-3 transform transition-transform duration-300 ${
                  milestone.achieved ? 'animate-bounce' : 'grayscale'
                }`}>
                  {milestone.emoji}
                </div>
                <span className={`font-bold text-xl mb-2 ${
                  milestone.achieved ? 'text-yellow-700' : 'text-gray-500'
                }`}>
                  {milestone.label}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  milestone.achieved 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-gray-500 bg-gray-200'
                }`}>
                  {milestone.achieved ? '✨ Conquistado!' : '🔒 Bloqueado'}
                </span>
              </div>
              
              {milestone.achieved && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white text-xl">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <p className="text-lg font-medium text-gray-800 mb-2">
            🎯 Próximo objetivo: {progressPercentage < 25 ? '25%' : progressPercentage < 50 ? '50%' : progressPercentage < 75 ? '75%' : '100%'}
          </p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {progressPercentage < 25 ? (goalAmount * 0.25).toLocaleString() : 
                progressPercentage < 50 ? (goalAmount * 0.5).toLocaleString() :
                progressPercentage < 75 ? (goalAmount * 0.75).toLocaleString() :
                goalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Restam R$ {progressPercentage < 25 ? ((goalAmount * 0.25) - currentAmount).toLocaleString() : 
                       progressPercentage < 50 ? ((goalAmount * 0.5) - currentAmount).toLocaleString() :
                       progressPercentage < 75 ? ((goalAmount * 0.75) - currentAmount).toLocaleString() :
                       Math.max(0, goalAmount - currentAmount).toLocaleString()} para o próximo marco
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog open={isAddAmountModalOpen} onOpenChange={setIsAddAmountModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span>Adicionar Valor</span>
              </div>
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
            <Button className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <span>Ajustar Meta</span>
              </div>
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
