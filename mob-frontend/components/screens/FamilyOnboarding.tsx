import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

interface FamilyOnboardingProps {
  onCreateFamily: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function FamilyOnboarding({ onCreateFamily, isLoading }: FamilyOnboardingProps) {
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyName.trim()) {
      setError('Por favor, insira um nome para sua família');
      return;
    }

    try {
      setError('');
      await onCreateFamily(familyName.trim());
    } catch (err) {
      setError('Erro ao criar família. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#F3E8FF] to-[#F0F9FF] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        {/* Ícone e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao MOB Finance! 👋
          </h1>
          <p className="text-gray-600">
            Vamos começar criando sua primeira família financeira
          </p>
        </div>

        {/* Benefícios */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-3 font-medium">
            Com a sua família você poderá:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Gerenciar rendas de todos os membros</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Controlar despesas compartilhadas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Planejar investimentos familiares</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Acompanhar projeções financeiras</span>
            </li>
          </ul>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="familyName" className="text-gray-700 mb-2 block">
              Nome da Família *
            </Label>
            <Input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(e) => {
                setFamilyName(e.target.value);
                setError('');
              }}
              placeholder="Ex: Família Silva, Casa dos Santos..."
              className="h-12 text-base"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !familyName.trim()}
            className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-base disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Criando...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                Criar Família
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>

        {/* Nota */}
        <p className="text-xs text-gray-500 text-center mt-6">
          💡 Após criar sua família, você poderá adicionar outros membros nas configurações
        </p>
      </Card>
    </div>
  );
}
