import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useExpenses } from '../../hooks';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { formatMoney, formatPercentage } from '../../lib/utils/money';
import { ExpenseCategory } from '../../lib/types/api.types';

export function Expenses() {
  const { family } = useFamilyContext();
  const {
    expenses,
    categories,
    summary,
    categoryBreakdown,
    isLoading,
    error,
    fetchCategories,
    fetchExpenses,
    fetchSummary,
    fetchCategoryBreakdown,
    createExpense,
    deleteExpense,
  } = useExpenses();

  const [selectedFilter, setSelectedFilter] = useState('Todas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    amount_cents: number;
    category_id: string;
    frequency: 'once' | 'monthly' | 'yearly';
  }>({
    name: '',
    description: '',
    amount_cents: 0,
    category_id: '',
    frequency: 'once',
  });

  useEffect(() => {
    if (family) {
      fetchCategories(family.id);
      fetchExpenses(family.id);
      fetchSummary(family.id);
      fetchCategoryBreakdown(family.id);
    }
  }, [family, selectedMonth]);

  const handleCreateExpense = async () => {
    if (!family) return;
    
    try {
      await createExpense(family.id, {
        name: formData.name,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        amount_cents: Math.round(formData.amount_cents * 100), // Convert to cents
        frequency: formData.frequency,
        splits: [], // Empty splits array for now
      });
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        amount_cents: 0,
        category_id: '',
        frequency: 'once' as const,
      });
      // Refresh data
      fetchExpenses(family.id);
      fetchSummary(family.id);
      fetchCategoryBreakdown(family.id);
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!family) return;
    
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await deleteExpense(family.id, id);
        fetchExpenses(family.id);
        fetchSummary(family.id);
        fetchCategoryBreakdown(family.id);
      } catch (err) {
        console.error('Failed to delete expense:', err);
      }
    }
  };

  const filters = ['Todas', 'Fixas', 'Variáveis'];

  if (!family) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Nenhuma família encontrada</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Erro ao carregar despesas: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          💸 Despesas de {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long' })}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB]">
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Aluguel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input 
                  id="description" 
                  placeholder="Detalhes adicionais"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount_cents}
                  onChange={(e) => setFormData({ ...formData, amount_cents: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Select 
                    value={formData.category_id}
                    onValueChange={(value: string) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequência</Label>
                  <Select 
                    value={formData.frequency}
                    onValueChange={(value: string) => setFormData({ ...formData, frequency: value as 'once' | 'monthly' | 'yearly' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Única</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={handleCreateExpense}
                  disabled={!formData.name || !formData.amount_cents || !formData.category_id}
                >
                  Salvar Despesa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === filter
                ? 'bg-[#3B82F6] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
          📂 Todas ▼
        </button>
      </div>

      {/* Layout 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Coluna Esquerda - Gráfico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de Pizza */}
          <Card className="p-6">
            <h3 className="text-xl mb-4">Distribuição por Categoria</h3>
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.map((cat) => ({
                        name: cat.category_name,
                        value: cat.percentage,
                        amount: cat.total_cents,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value.toFixed(0)}%`}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${(index * 60) % 360}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined, name: string | undefined, props: any) => [
                        formatMoney(props.payload.amount),
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold">{formatMoney((summary?.total_once || 0) + (summary?.total_monthly || 0) + (summary?.total_yearly || 0))}</p>
                  <p className="text-sm text-gray-500">Total do Mês</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-10">Nenhuma despesa registrada</p>
            )}
          </Card>

          {/* Resumo por Categoria */}
          <Card className="p-6">
            <h3 className="text-xl mb-4">Resumo por Categoria</h3>
            <div className="space-y-3">
              {categoryBreakdown && categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📦</span>
                      <span className="text-sm font-medium">{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{cat.percentage.toFixed(0)}%</span>
                      <span className="font-bold">{formatMoney(cat.total_cents)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma categoria</p>
              )}
            </div>
          </Card>
        </div>

        {/* Coluna Direita - Lista de Despesas */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xl">Lista de Despesas ({expenses?.length || 0})</h3>
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => (
              <Card
                key={expense.id}
                className="p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {categories.find((c) => c.id === expense.category_id)?.icon || '📦'}
                    </span>
                    <div>
                      <h4 className="font-bold">{expense.name}</h4>
                      {expense.description && <p className="text-sm text-gray-500">{expense.description}</p>}
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {expense.frequency === 'monthly' ? 'Mensal' : expense.frequency === 'yearly' ? 'Anual' : 'Única'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {categories.find((c) => c.id === expense.category_id)?.name || 'Outros'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <p className="text-2xl font-bold mb-3">{formatMoney(expense.amount_cents)}</p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {new Date(expense.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  {expense.frequency === 'monthly' && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      Recorrente
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-10">
              <p className="text-gray-500 text-center">Nenhuma despesa registrada neste mês</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
