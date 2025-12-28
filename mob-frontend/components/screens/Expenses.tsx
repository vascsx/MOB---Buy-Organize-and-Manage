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

// Static categories matching backend expectations
const STATIC_CATEGORIES = [
  { id: 1, name: 'Moradia', icon: '🏠' },
  { id: 2, name: 'Alimentação', icon: '🍽️' },
  { id: 3, name: 'Transporte', icon: '🚗' },
  { id: 4, name: 'Saúde', icon: '🏥' },
  { id: 5, name: 'Educação', icon: '📚' },
  { id: 6, name: 'Lazer', icon: '🎮' },
  { id: 7, name: 'Vestuário', icon: '👔' },
  { id: 8, name: 'Utilidades', icon: '💡' },
  { id: 9, name: 'Outros', icon: '📦' },
];

export function Expenses() {
  const { family, members } = useFamilyContext();
  const {
    expenses,
    summary,
    categoryBreakdown,
    isLoading,
    error,
    fetchExpenses,
    fetchSummary,
    fetchCategoryBreakdown,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    amount_cents: number;
    amount_cents_display: string;
    category_id: string;
    frequency: 'once' | 'monthly' | 'yearly';
    due_day: number;
  }>({
    name: '',
    description: '',
    amount_cents: 0,
    amount_cents_display: '',
    category_id: '',
    frequency: 'once',
    due_day: 1,
  });

  useEffect(() => {
    if (family) {
      fetchExpenses(family.id);
      fetchSummary(family.id);
      fetchCategoryBreakdown(family.id);
    }
  }, [family, selectedMonth]);

  // Debug: Log category breakdown data
  useEffect(() => {
    console.log('Category Breakdown:', categoryBreakdown);
    console.log('Summary:', summary);
  }, [categoryBreakdown, summary]);

  const handleOpenEditModal = (expense: any) => {
    setIsEditMode(true);
    setEditingExpenseId(expense.id);
    setFormData({
      name: expense.name,
      description: expense.description || '',
      amount_cents: expense.amount_cents,
      amount_cents_display: (expense.amount_cents / 100).toFixed(2).replace('.', ','),
      category_id: String(expense.category_id),
      frequency: expense.frequency,
      due_day: expense.due_day || 1,
    });
    setIsDialogOpen(true);
  };

  const handleCreateExpense = async () => {
    if (!family) return;
    
    try {
      // Get the first member from family to use as default split
      const defaultMember = members?.[0];
      if (!defaultMember) {
        console.error('No family members found');
        return;
      }
      
      if (isEditMode && editingExpenseId) {
        // Update existing expense
        await updateExpense(family.id, editingExpenseId, {
          name: formData.name,
          description: formData.description || undefined,
          category_id: parseInt(formData.category_id),
          amount_cents: formData.amount_cents,
          frequency: formData.frequency,
          due_day: formData.due_day,
          splits: [{
            family_member_id: defaultMember.id,
            percentage: 100,
          }],
        });
      } else {
        // Create new expense
        await createExpense(family.id, {
          name: formData.name,
          description: formData.description || undefined,
          category_id: parseInt(formData.category_id),
          amount_cents: formData.amount_cents,
          frequency: formData.frequency,
          due_day: formData.due_day,
          splits: [{
            family_member_id: defaultMember.id,
            percentage: 100,
          }],
        });
      }
      
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingExpenseId(null);
      setFormData({
        name: '',
        description: '',
        amount_cents: 0,
        amount_cents_display: '',
        category_id: '',
        frequency: 'once' as const,
        due_day: 1,
      });
      // Refresh data
      fetchExpenses(family.id);
      fetchSummary(family.id);
      fetchCategoryBreakdown(family.id);
    } catch (err) {
      console.error('Failed to save expense:', err);
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

  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Única', value: 'once' },
    { label: 'Mensal', value: 'monthly' },
    { label: 'Anual', value: 'yearly' },
  ];

  if (!family) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Nenhuma família encontrada</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
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
          {(() => {
            const date = new Date(selectedMonth + '-01T00:00:00');
            const month = date.toLocaleString('pt-BR', { month: 'long' });
            const year = date.getFullYear();
            return `💸 Despesas de ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
          })()}
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
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={formData.amount_cents_display}
                  onChange={e => {
                    let value = e.target.value.replace(/[^\d,.]/g, '');
                    // Mantém só o primeiro separador decimal
                    const firstComma = value.indexOf(',');
                    const firstDot = value.indexOf('.');
                    let sep = -1;
                    if (firstComma !== -1 && firstDot !== -1) {
                      sep = Math.min(firstComma, firstDot);
                    } else if (firstComma !== -1) {
                      sep = firstComma;
                    } else if (firstDot !== -1) {
                      sep = firstDot;
                    }
                    if (sep !== -1) {
                      let before = value.slice(0, sep + 1);
                      let after = value.slice(sep + 1).replace(/[.,]/g, '');
                      value = before + after;
                    }
                    // Troca vírgula por ponto para parseFloat
                    const parseValue = value.replace(',', '.');
                    const floatValue = parseFloat(parseValue);
                    setFormData({
                      ...formData,
                      amount_cents: isNaN(floatValue) ? 0 : Math.round(floatValue * 100),
                      amount_cents_display: value
                    });
                  }}
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
                      {STATIC_CATEGORIES.map((cat) => (
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
              <div>
                <Label htmlFor="due_day">Dia de Vencimento</Label>
                <Input
                  id="due_day"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  value={formData.due_day}
                  onChange={(e) => setFormData({ ...formData, due_day: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setEditingExpenseId(null);
                    setFormData({
                      name: '',
                      description: '',
                      amount_cents: 0,
                      amount_cents_display: '',
                      category_id: '',
                      frequency: 'once',
                      due_day: 1,
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={handleCreateExpense}
                  disabled={!formData.name || !formData.amount_cents || !formData.category_id}
                >
                  {isEditMode ? 'Atualizar Despesa' : 'Salvar Despesa'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros por Frequência */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedFilter === filter.value
                ? 'bg-[#3B82F6] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Layout 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Coluna Esquerda - Gráfico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de Pizza */}
          <Card className="p-6">
            <h3 className="text-xl mb-4">Distribuição por Categoria</h3>
            {(() => {
              const chartData = (categoryBreakdown && categoryBreakdown.length > 0) 
                ? categoryBreakdown 
                : (summary?.by_category || []);
              
              return chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData.map((cat) => ({
                        name: cat.category_name,
                        value: cat.percentage ?? 0,
                        amount: cat.total,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${value.toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${(index * 60) % 360}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined, name: string | undefined, props: any) => [
                        formatMoney((props.payload.amount ?? 0) * 100),
                        props.payload.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold">{formatMoney(((summary?.total_once || 0) + (summary?.total_monthly || 0) + (summary?.total_yearly || 0)) * 100)}</p>
                  <p className="text-sm text-gray-500">Total do Mês</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-10">Nenhuma despesa registrada</p>
            );
            })()}
          </Card>

          {/* Resumo por Categoria */}
          <Card className="p-6">
            <h3 className="text-xl mb-4">Resumo por Categoria</h3>
            <div className="space-y-3">
              {(() => {
                const chartData = (categoryBreakdown && categoryBreakdown.length > 0) 
                  ? categoryBreakdown 
                  : (summary?.by_category || []);
                
                return chartData.length > 0 ? (
                  chartData.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {STATIC_CATEGORIES.find((c) => c.id === cat.category_id)?.icon || '📦'}
                        </span>
                        <span className="text-sm font-medium">{cat.category_name || 'Sem categoria'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{(cat.percentage || 0).toFixed(0)}%</span>
                        <span className="font-bold">{formatMoney((cat.total ?? 0) * 100)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhuma categoria</p>
                );
              })()}
            </div>
          </Card>
        </div>

        {/* Coluna Direita - Lista de Despesas */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xl">Lista de Despesas ({expenses?.length || 0})</h3>
          {expenses && expenses.length > 0 ? (
            expenses
              .filter((expense) =>
                selectedFilter === 'all' ? true : expense.frequency === selectedFilter
              )
              .map((expense) => (
                <Card
                  key={expense.id}
                  className="p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {STATIC_CATEGORIES.find((c) => c.id === expense.category_id)?.icon || '📦'}
                      </span>
                      <div>
                        <h4 className="font-bold">{expense.name}</h4>
                        {expense.description && <p className="text-sm text-gray-500">{expense.description}</p>}
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {expense.frequency === 'monthly' ? 'Mensal' : expense.frequency === 'yearly' ? 'Anual' : 'Única'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {STATIC_CATEGORIES.find((c) => c.id === expense.category_id)?.name || 'Outros'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => handleOpenEditModal(expense)}
                      >
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
