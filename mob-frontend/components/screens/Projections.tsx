import React, { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function Projections() {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);

  const baseData = [
    { year: 2025, reserve: 14000, investments: 25000 },
    { year: 2026, reserve: 28000, investments: 38000 },
    { year: 2027, reserve: 42000, investments: 52000 },
    { year: 2028, reserve: 56000, investments: 68000 },
    { year: 2029, reserve: 56000, investments: 86000 },
    { year: 2030, reserve: 56000, investments: 105238 },
  ];

  const totalPatrimony2030 = baseData[baseData.length - 1].reserve + baseData[baseData.length - 1].investments;

  const toggleScenario = (scenarioId: string) => {
    setExpandedScenario(expandedScenario === scenarioId ? null : scenarioId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🔮 Projeção Patrimonial</h1>
          <p className="text-gray-600 mt-1">Visualize seu futuro financeiro</p>
        </div>
        <select className="px-4 py-2 border rounded-lg bg-white">
          <option>5 anos</option>
          <option>10 anos</option>
          <option>15 anos</option>
        </select>
      </div>

      {/* Resultado Futuro */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] rounded-lg p-8 shadow-lg text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <span className="text-5xl mb-3 block">💰</span>
          <p className="text-base opacity-80 mb-2">Seu Patrimônio em 2030</p>
          <p className="text-6xl font-bold mb-3">R$ {totalPatrimony2030.toLocaleString()}</p>
          <p className="text-sm opacity-60">(Cenário otimista com base atual)</p>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6">📊 Evolução Patrimonial</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={baseData}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="year" stroke="#6B7280" />
            <YAxis
              stroke="#6B7280"
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number | undefined, name?: string) => [
                `R$ ${(value || 0).toLocaleString()}`,
                name === 'reserve' ? 'Reserva' : name === 'investments' ? 'Investimentos' : (name || ''),
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
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
            />
            <Area
              type="monotone"
              dataKey="investments"
              stackId="1"
              stroke="#3B82F6"
              fill="url(#colorInvestments)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
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
                    <Input type="text" placeholder="+R$ 2.000/mês" className="mt-1" />
                  </div>
                </div>
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">Aplicar</Button>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="font-bold text-[#10B981]">
                    ➜ Novo patrimônio: R$ 125.000 (+R$ 19k)
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
                    <Input type="text" placeholder="R$ 1.500/mês" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input type="text" placeholder="Ex: Financiamento carro" className="mt-1" />
                </div>
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">Aplicar</Button>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="font-bold text-[#EF4444]">
                    ➜ Novo patrimônio: R$ 75.000 (-R$ 30k)
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
                    <Input type="text" placeholder="R$ 8.000/mês" className="mt-1" />
                  </div>
                </div>
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">Aplicar</Button>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="font-bold text-[#3B82F6]">
                    ➜ Novo patrimônio: R$ 145.000 (+R$ 39k)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4">
          + Adicionar cenário
        </Button>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Limpar cenários
        </Button>
        <div className="flex-1 relative">
          <Button className="bg-[#3B82F6] hover:bg-[#2563EB] w-full">
            Exportar projeção ▼
          </Button>
        </div>
      </div>
    </div>
  );
}
