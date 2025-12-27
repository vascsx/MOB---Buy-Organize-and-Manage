import React, { useState, useEffect } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { EmergencyFund, EmergencyFundProgress } from '../types/finance.types';
import { emergencyFundAPI } from '../api/emergencyFund.api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MoneyDisplay } from '../components/ui/MoneyDisplay';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';

export const EmergencyFundPage: React.FC = () => {
  const { selectedFamily } = useFamily();
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund | null>(null);
  const [progress, setProgress] = useState<EmergencyFundProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedFamily) {
      loadEmergencyFund();
    }
  }, [selectedFamily]);

  const loadEmergencyFund = async () => {
    if (!selectedFamily) return;
    
    try {
      setIsLoading(true);
      const [fundData, progressData] = await Promise.all([
        emergencyFundAPI.get(selectedFamily.id),
        emergencyFundAPI.getProgress(selectedFamily.id)
      ]);
      setEmergencyFund(fundData);
      setProgress(progressData);
    } catch (error) {
      console.error('Erro ao carregar reserva de emergência:', error);
      // Se não existir, será null
      setEmergencyFund(null);
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressColor = (percentage: number): 'danger' | 'warning' | 'success' => {
    if (percentage < 30) return 'danger';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  const getStatusMessage = (percentage: number): string => {
    if (percentage < 30) return '🚨 Atenção! Reserve abaixo do recomendado';
    if (percentage < 70) return '⚠️ Progresso moderado, continue assim!';
    if (percentage < 100) return '✅ Muito bem! Falta pouco para a meta';
    return '🎉 Parabéns! Meta alcançada!';
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
          description="Selecione uma família para gerenciar a reserva de emergência"
        />
      </div>
    );
  }

  if (!emergencyFund || !progress) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reserva de Emergência</h1>
          <p className="text-gray-600 mt-1">Proteja sua família de imprevistos</p>
        </div>

        <EmptyState
          icon="🆘"
          title="Reserva não configurada"
          description="Configure sua reserva de emergência para ter segurança financeira em momentos difíceis"
          action={<Button variant="primary" onClick={() => setShowForm(true)}>Configurar Reserva</Button>}
        />
      </div>
    );
  }

  const progressPercentage = progress.percentage_complete;
  const progressColor = getProgressColor(progressPercentage);
  const monthsRemaining = Math.max(0, progress.estimated_months);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reserva de Emergência</h1>
          <p className="text-gray-600 mt-1">Sua segurança financeira</p>
        </div>
        <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Editar Meta'}
        </Button>
      </div>

      {/* Status Geral */}
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getStatusMessage(progressPercentage)}
          </h2>
          <p className="text-gray-600">
            Meta: {emergencyFund.target_months} meses de despesas
          </p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso da Meta</span>
            <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <ProgressBar
            current={emergencyFund.current_amount_cents}
            target={emergencyFund.target_amount_cents}
            color={progressColor}
            size="lg"
            showPercentage={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Saldo Atual</div>
            <MoneyDisplay amountCents={emergencyFund.current_amount_cents} variant="large" />
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Meta</div>
            <MoneyDisplay amountCents={emergencyFund.target_amount_cents} variant="large" color="success" />
          </div>
        </div>
      </Card>

      {/* Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="💰 Falta para a Meta">
          <MoneyDisplay amountCents={progress.remaining_cents} variant="large" color="danger" />
          {monthsRemaining > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Aproximadamente {monthsRemaining} {monthsRemaining === 1 ? 'mês' : 'meses'} com aporte mensal
            </p>
          )}
        </Card>

        <Card title="📊Mporte Mensal">
          <MoneyDisplay amountCents={emergencyFund.monthly_goal_cents} variant="large" />
          <p className="text-sm text-gray-600 mt-2">
            Com este aporte você alcança a meta em {monthsRemaining} meses
          </p>
        </Card>
      </div>

      {/* Dicas */}
      <Card title="💡 Dicas para sua Reserva">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span>✅</span>
            <p>Mantenha sua reserva em aplicações de liquidez diária (Tesouro Selic, CDB com liquidez)</p>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <p>O ideal é ter de 6 a 12 meses de despesas guardadas</p>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <p>Use apenas em emergências reais (desemprego, saúde, reparos urgentes)</p>
          </div>
          <div className="flex items-start gap-2">
            <span>✅</span>
            <p>Quando usar, reponha assim que possível</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
