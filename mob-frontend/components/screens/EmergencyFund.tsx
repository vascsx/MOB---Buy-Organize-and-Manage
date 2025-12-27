import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Slider } from '../ui/slider';

export function EmergencyFund() {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(6);
  const [monthlyContribution, setMonthlyContribution] = useState(800);

  const currentAmount = 14058.75;
  const monthlyExpenses = 9372.5;
  const goalAmount = monthlyExpenses * 6;
  const progressPercentage = (currentAmount / goalAmount) * 100;
  const remaining = goalAmount - currentAmount;

  const evolutionData = [
    { month: 'Jul', value: 8000 },
    { month: 'Ago', value: 9200 },
    { month: 'Set', value: 10800 },
    { month: 'Out', value: 12100 },
    { month: 'Nov', value: 13400 },
    { month: 'Dez', value: 14058.75 },
  ];

  const milestones = [
    { percentage: 25, label: '25%', emoji: '🏅', achieved: true },
    { percentage: 50, label: '50%', emoji: '🥈', achieved: false },
    { percentage: 75, label: '75%', emoji: '🥇', achieved: false },
    { percentage: 100, label: '100%', emoji: '🏆', achieved: false },
  ];

  const estimatedMonths = Math.ceil(remaining / monthlyContribution);

  return (
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
          <p className="text-2xl font-bold">6 meses de despesas</p>
          <Badge className="bg-green-100 text-[#10B981] hover:bg-green-100">
            Recomendado
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          (R$ {monthlyExpenses.toLocaleString()} × 6 = R$ {goalAmount.toLocaleString()})
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
            Você já conquistou 1/4 da meta! 🎉
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
            Com aporte de R$ {monthlyContribution}/mês:
          </p>
          <p className="text-2xl font-bold text-[#3B82F6] mb-2">
            ➜ Você alcança a meta em {estimatedMonths} meses
          </p>
          <p className="text-gray-700">
            ➜ Estimativa:{' '}
            {new Date(new Date().setMonth(new Date().getMonth() + estimatedMonths)).toLocaleDateString(
              'pt-BR',
              { month: 'long', year: 'numeric' }
            )}
          </p>
        </div>
      </div>

      {/* Sugestão Inteligente */}
      <div className="bg-[#FEF3C7] rounded-lg p-6 border border-[#F59E0B]">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-3">Sugestão Inteligente</h3>
            <p className="text-sm text-gray-800 mb-2">
              Baseado na sua renda disponível (R$ 4.000/mês), sugerimos aportar R$ 1.200/mês
              (30%).
            </p>
            <p className="text-sm text-gray-800 mb-4">
              Assim você atinge a meta em 35 meses! 🎉
            </p>
            <div className="flex gap-3">
              <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
                Aplicar sugestão
              </Button>
              <Button variant="outline">Personalizar</Button>
            </div>
          </div>
        </div>
      </div>

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
        <Button className="bg-[#10B981] hover:bg-[#059669] flex-1">Adicionar Valor</Button>
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
                <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB] flex-1">Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
