import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFamilyContext } from '../contexts/FamilyContext';
import { useInvestments } from '../hooks/useInvestments';
import type { CreateInvestmentRequest, Investment } from '../lib/types/api.types';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investment?: Investment; // Optional for edit mode
}

export function AddInvestmentModal({ isOpen, onClose, onSuccess, investment }: AddInvestmentModalProps) {
  const { family } = useFamilyContext();
  const { createInvestment, updateInvestment } = useInvestments();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!investment;

  const [formData, setFormData] = useState<CreateInvestmentRequest>({
    name: '',
    type: 'renda_fixa',
    current_balance_cents: 0,
    monthly_contribution_cents: 0,
    annual_return_rate: 0,
  });

  // Populate form when editing
  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name,
        type: investment.type,
        current_balance_cents: investment.current_balance_cents,
        monthly_contribution_cents: investment.monthly_contribution_cents,
        annual_return_rate: investment.annual_return_rate,
      });
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        type: 'renda_fixa',
        current_balance_cents: 0,
        monthly_contribution_cents: 0,
        annual_return_rate: 0,
      });
    }
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!family) return;
    
    if (!formData.name.trim()) {
      setError('Informe o nome do investimento');
      return;
    }

    if (formData.monthly_contribution_cents <= 0) {
      setError('Informe o aporte mensal');
      return;
    }

    if (formData.annual_return_rate <= 0 || formData.annual_return_rate > 100) {
      setError('Informe uma taxa de retorno válida (0-100%)');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      if (isEditMode && investment) {
        await updateInvestment(family.id, investment.id, formData);
      } else {
        await createInvestment(family.id, formData);
      }
      
      // Resetar form apenas se não for modo de edição
      if (!isEditMode) {
        setFormData({
          name: '',
          type: 'renda_fixa',
          current_balance_cents: 0,
          monthly_contribution_cents: 0,
          annual_return_rate: 0,
        });
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} investimento`;
      setError(errorMsg);
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} investimento:`, err.response?.data || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoneyInput = (field: keyof CreateInvestmentRequest, value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    setFormData({ ...formData, [field]: Number(numericValue) });
  };

  const handlePercentInput = (value: string) => {
    // Remove tudo que não é número ou vírgula/ponto
    const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue) || 0;
    setFormData({ ...formData, annual_return_rate: numericValue });
  };

  const formatMoneyDisplay = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar Investimento' : 'Novo Investimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Nome */}
          <div>
            <Label htmlFor="name">Nome do Investimento *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Tesouro Direto, Ações, Bitcoin"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <Label htmlFor="type">Tipo de Investimento *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renda_fixa">🏛️ Renda Fixa</SelectItem>
                <SelectItem value="renda_variavel">📈 Renda Variável</SelectItem>
                <SelectItem value="fundos">💼 Fundos</SelectItem>
                <SelectItem value="crypto">₿ Criptomoedas</SelectItem>
                <SelectItem value="imoveis">🏠 Imóveis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor Atual */}
          <div>
            <Label htmlFor="current">Valor Atual (opcional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="current"
                type="text"
                value={formatMoneyDisplay(formData.current_balance_cents)}
                onChange={(e) => handleMoneyInput('current_balance_cents', e.target.value)}
                className="pl-12"
                placeholder="0,00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Quanto você já tem investido</p>
          </div>

          {/* Aporte Mensal */}
          <div>
            <Label htmlFor="monthly">Aporte Mensal *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="monthly"
                type="text"
                value={formatMoneyDisplay(formData.monthly_contribution_cents)}
                onChange={(e) => handleMoneyInput('monthly_contribution_cents', e.target.value)}
                className="pl-12"
                placeholder="0,00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Quanto você vai investir por mês</p>
          </div>

          {/* Taxa de Retorno */}
          <div>
            <Label htmlFor="rate">Taxa de Retorno Anual (%) *</Label>
            <div className="relative">
              <Input
                id="rate"
                type="text"
                value={formData.annual_return_rate || ''}
                onChange={(e) => handlePercentInput(e.target.value)}
                placeholder="0.00"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ex: Poupança ~6%, Tesouro Selic ~10%, Ações ~12%
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Adicionar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
