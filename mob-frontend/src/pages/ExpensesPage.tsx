import React, { useState, useEffect } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { Expense, ExpenseSummary, ExpenseCategory } from '../types/finance.types';
import { expensesAPI } from '../api/expenses.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

export const ExpensesPage: React.FC = () => {
  const { selectedFamily } = useFamily();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedFamily) {
      loadExpenses();
    }
  }, [selectedFamily, selectedCategory]);

  const loadExpenses = async () => {
    if (!selectedFamily) return;
    
    try {
      setIsLoading(true);
      const [categoriesData, summaryData] = await Promise.all([
        expensesAPI.getCategories(selectedFamily.id),
        expensesAPI.getSummary(selectedFamily.id)
      ]);
      
      setCategories(categoriesData);
      setSummary(summaryData);

      if (selectedCategory) {
        const expensesData = await expensesAPI.getAll(selectedFamily.id);
        setExpenses(expensesData.filter(e => e.category_id === selectedCategory));
      } else {
        const expensesData = await expensesAPI.getAll(selectedFamily.id);
        setExpenses(expensesData);
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      'Moradia': '🏠',
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Saúde': '🏥',
      'Educação': '📚',
      'Lazer': '🎮',
      'Vestuário': '👕',
      'Contas': '📄',
      'Outros': '📦'
    };
    return icons[categoryName] || '📦';
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'once': 'Única',
      'monthly': 'Mensal',
      'yearly': 'Anual'
    };
    return labels[frequency] || frequency;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  if (!selectedFamily) {
    return (
      <div className="p-6">
        <EmptyState
          icon="🏠"
          title="Nenhuma família selecionada"
          description="Selecione uma família para gerenciar as despesas"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-600 mt-1">Controle os gastos da família</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nova Despesa'}
        </Button>
      </div>

      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="💸 Total de Despesas">
            <MoneyDisplay amountCents={summary.total_monthly_cents} variant="large" color="danger" />
            <p className="text-sm text-gray-600 mt-2">{summary.expenses_count} despesa(s) cadastrada(s)</p>
          </Card>
          <Card title="📊mMaior Categoria">
            {summary.by_category && summary.by_category.length > 0 && (
              <>
                <div className="text-2xl mb-2">
                  {getCategoryIcon(summary.by_category[0].category_name)} {summary.by_category[0].category_name}
                </div>
                <MoneyDisplay amountCents={summary.by_category[0].total_cents} />
              </>
            )}
          </Card>
        </div>
      )}

      {/* Filtros de Categoria */}
      <Card title="🏷️ Filtrar por Categoria">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category.name)} {category.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Lista de Despesas */}
      {expenses.length === 0 ? (
        <EmptyState
          icon="💸"
          title="Nenhuma despesa cadastrada"
          description="Adicione a primeira despesa da família"
          action={<Button variant="primary" onClick={() => setShowForm(true)}>+ Nova Despesa</Button>}
        />
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{expense.category ? getCategoryIcon(expense.category.name) : '💸'}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{expense.description}</h3>
                      <p className="text-sm text-gray-600">
                        {expense.category?.name || 'Sem categoria'} • {getFrequencyLabel(expense.frequency)}
                      </p>
                    </div>
                  </div>
                  {expense.splits && expense.splits.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="font-medium mb-1">Divisão:</div>
                      {expense.splits.map((split, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>Membro {split.family_member_id}: {split.percentage.toFixed(1)}%</span>
                          <MoneyDisplay 
                            amountCents={split.amount_cents} 
                            variant="small"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <MoneyDisplay amountCents={expense.amount_cents} variant="default" color="danger" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
