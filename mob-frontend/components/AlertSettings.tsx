import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

interface AlertSettingsType {
  highExpenses: boolean;
  emergencyFund: boolean;
  investment: boolean;
  savingsGoal: boolean;
  incomeVariation: boolean;
}

const defaultSettings: AlertSettingsType = {
  highExpenses: true,
  emergencyFund: true,
  investment: true,
  savingsGoal: true,
  incomeVariation: true,
};

export function AlertSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AlertSettingsType>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('alertSettings');
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load alert settings:', error);
    }
  }, []);

  const handleToggle = (key: keyof AlertSettingsType) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('alertSettings', JSON.stringify(newSettings));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Configurar Alertas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Alertas do Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-gray-600">
            Escolha quais alertas você deseja visualizar no dashboard
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="highExpenses" className="text-sm font-medium cursor-pointer">
                  Despesas Altas
                </Label>
                <p className="text-xs text-gray-500">
                  Alerta quando gastos excedem 70% da renda
                </p>
              </div>
              <Switch
                id="highExpenses"
                checked={settings.highExpenses}
                onCheckedChange={() => handleToggle('highExpenses')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergencyFund" className="text-sm font-medium cursor-pointer">
                  Reserva de Emergência
                </Label>
                <p className="text-xs text-gray-500">
                  Avisos sobre sua reserva de emergência
                </p>
              </div>
              <Switch
                id="emergencyFund"
                checked={settings.emergencyFund}
                onCheckedChange={() => handleToggle('emergencyFund')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="investment" className="text-sm font-medium cursor-pointer">
                  Investimentos
                </Label>
                <p className="text-xs text-gray-500">
                  Sugestões sobre investimentos
                </p>
              </div>
              <Switch
                id="investment"
                checked={settings.investment}
                onCheckedChange={() => handleToggle('investment')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="savingsGoal" className="text-sm font-medium cursor-pointer">
                  Meta de Economia
                </Label>
                <p className="text-xs text-gray-500">
                  Alertas sobre saldo e economias
                </p>
              </div>
              <Switch
                id="savingsGoal"
                checked={settings.savingsGoal}
                onCheckedChange={() => handleToggle('savingsGoal')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="incomeVariation" className="text-sm font-medium cursor-pointer">
                  Variação de Renda
                </Label>
                <p className="text-xs text-gray-500">
                  Avisos sobre mudanças na renda
                </p>
              </div>
              <Switch
                id="incomeVariation"
                checked={settings.incomeVariation}
                onCheckedChange={() => handleToggle('incomeVariation')}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setIsOpen(false)}>
              Concluído
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
