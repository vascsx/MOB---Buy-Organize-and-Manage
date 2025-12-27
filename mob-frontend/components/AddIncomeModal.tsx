import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFamilyContext } from '../contexts/FamilyContext';
import { useIncomes } from '../hooks/useIncomes';
import type { FamilyMember, CreateIncomeRequest } from '../lib/types/api.types';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddIncomeModal({ isOpen, onClose, onSuccess }: AddIncomeModalProps) {
  const { family, members, fetchMembers } = useFamilyContext();
  const { createIncome } = useIncomes();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateIncomeRequest>({
    family_member_id: 0,
    type: 'clt',
    net_monthly_cents: 0,
    food_voucher_cents: 0,
    transport_voucher_cents: 0,
    bonus_cents: 0,
  });

  // Buscar membros automaticamente quando o modal abre
  React.useEffect(() => {
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

    if (formData.net_monthly_cents <= 0) {
      setError('Informe a renda líquida');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      // Converter tipo para maiúsculas antes de enviar
      const payload = {
        ...formData,
        type: formData.type.toUpperCase() as any,
      };
      await createIncome(family.id, payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar renda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoneyInput = (field: keyof CreateIncomeRequest, value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    setFormData({ ...formData, [field]: Number(numericValue) });
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
          <h2 className="text-xl font-bold text-gray-900">Adicionar Renda</h2>
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

          {/* Membro */}
          <div>
            <Label htmlFor="member">Membro da Família *</Label>
            <Select
              value={String(formData.family_member_id)}
              onValueChange={(value) => setFormData({ ...formData, family_member_id: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um membro" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div>
            <Label htmlFor="type">Tipo de Renda *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">PJ</SelectItem>
                <SelectItem value="autonomo">Autônomo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Renda Líquida */}
          <div>
            <Label htmlFor="net">Renda Líquida Mensal *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="net"
                type="text"
                value={formatMoneyDisplay(formData.net_monthly_cents)}
                onChange={(e) => handleMoneyInput('net_monthly_cents', e.target.value)}
                className="pl-12"
                placeholder="0,00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Informe o valor que você recebe após os descontos</p>
          </div>

          {/* Vale Alimentação */}
          <div>
            <Label htmlFor="food">Vale Alimentação (opcional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="food"
                type="text"
                value={formatMoneyDisplay(formData.food_voucher_cents || 0)}
                onChange={(e) => handleMoneyInput('food_voucher_cents', e.target.value)}
                className="pl-12"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Vale Transporte */}
          <div>
            <Label htmlFor="transport">Vale Transporte (opcional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="transport"
                type="text"
                value={formatMoneyDisplay(formData.transport_voucher_cents || 0)}
                onChange={(e) => handleMoneyInput('transport_voucher_cents', e.target.value)}
                className="pl-12"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Bônus */}
          <div>
            <Label htmlFor="bonus">Bônus Mensal (opcional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="bonus"
                type="text"
                value={formatMoneyDisplay(formData.bonus_cents || 0)}
                onChange={(e) => handleMoneyInput('bonus_cents', e.target.value)}
                className="pl-12"
                placeholder="0,00"
              />
            </div>
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
              {isLoading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
