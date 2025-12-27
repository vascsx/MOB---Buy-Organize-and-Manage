import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFamilyContext } from '../contexts/FamilyContext';
import { useIncomes } from '../hooks/useIncomes';
import type { Income, CreateIncomeRequest } from '../lib/types/api.types';

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  income: Income;
}

export function EditIncomeModal({ isOpen, onClose, onSuccess, income }: EditIncomeModalProps) {
  const { family, members, fetchMembers } = useFamilyContext();
  const { updateIncome } = useIncomes();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateIncomeRequest>({
    family_member_id: income.family_member_id,
    type: income.type.toLowerCase() as 'clt' | 'pj',
    gross_monthly_cents: income.gross_monthly_cents,
    net_monthly_cents: income.net_monthly_cents || 0,
    food_voucher_cents: income.food_voucher_cents || 0,
    transport_voucher_cents: income.transport_voucher_cents || 0,
    bonus_cents: income.bonus_cents || 0,
  });

  // Atualizar form quando income mudar
  useEffect(() => {
    setFormData({
      family_member_id: income.family_member_id,
      type: income.type.toLowerCase() as 'clt' | 'pj',
      gross_monthly_cents: income.gross_monthly_cents,
      net_monthly_cents: income.net_monthly_cents || 0,
      food_voucher_cents: income.food_voucher_cents || 0,
      transport_voucher_cents: income.transport_voucher_cents || 0,
      bonus_cents: income.bonus_cents || 0,
    });
  }, [income]);

  // Buscar membros automaticamente quando o modal abre
  useEffect(() => {
    if (isOpen && family) {
      fetchMembers();
    }
  }, [isOpen, family, fetchMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!family) return;
    
    if (formData.family_member_id === 0) {
      setError('Selecione um membro da família');
      return;
    }

    if (formData.gross_monthly_cents <= 0) {
      setError('O salário bruto deve ser maior que zero');
      return;
    }

    if (formData.net_monthly_cents <= 0) {
      setError('O salário líquido deve ser maior que zero');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Converter tipo para uppercase antes de enviar
      const dataToSend = {
        ...formData,
        type: formData.type.toUpperCase(),
      };
      
      await updateIncome(family.id, income.id, dataToSend as any);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar renda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoneyInput = (field: keyof CreateIncomeRequest, value: string) => {
    // Remove tudo exceto números
    const numericValue = value.replace(/\D/g, '');
    const cents = parseInt(numericValue) || 0;
    setFormData((prev) => ({ ...prev, [field]: cents }));
  };

  const formatMoneyDisplay = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Editar Renda</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Membro */}
          <div className="space-y-2">
            <Label htmlFor="member">Membro da Família *</Label>
            <Select
              value={formData.family_member_id.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, family_member_id: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um membro" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Renda */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Renda *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'clt' | 'pj') =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">PJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gross">Salário Bruto (R$) *</Label>
              <Input
                id="gross"
                type="text"
                placeholder="0,00"
                value={formatMoneyDisplay(formData.gross_monthly_cents)}
                onChange={(e) => handleMoneyInput('gross_monthly_cents', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="net">Salário Líquido (R$) *</Label>
              <Input
                id="net"
                type="text"
                placeholder="0,00"
                value={formatMoneyDisplay(formData.net_monthly_cents)}
                onChange={(e) => handleMoneyInput('net_monthly_cents', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Benefícios (Opcional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="food_voucher">Vale Alimentação (R$)</Label>
                <Input
                  id="food_voucher"
                  type="text"
                  placeholder="0,00"
                  value={formatMoneyDisplay(formData.food_voucher_cents || 0)}
                  onChange={(e) => handleMoneyInput('food_voucher_cents', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transport_voucher">Vale Transporte (R$)</Label>
                <Input
                  id="transport_voucher"
                  type="text"
                  placeholder="0,00"
                  value={formatMoneyDisplay(formData.transport_voucher_cents || 0)}
                  onChange={(e) => handleMoneyInput('transport_voucher_cents', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Bônus/13º (R$)</Label>
              <Input
                id="bonus"
                type="text"
                placeholder="0,00"
                value={formatMoneyDisplay(formData.bonus_cents || 0)}
                onChange={(e) => handleMoneyInput('bonus_cents', e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
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
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
