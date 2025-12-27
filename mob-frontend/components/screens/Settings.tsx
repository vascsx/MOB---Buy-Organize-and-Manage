import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function Settings() {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [joaoPercentage, setJoaoPercentage] = useState(60);
  const [mariaPercentage, setMariaPercentage] = useState(40);

  const members = [
    {
      id: 1,
      name: 'João Silva (Você)',
      role: 'Owner',
      type: 'CLT',
      status: 'Ativo',
      isOwner: true,
      avatar: 'JS',
    },
    {
      id: 2,
      name: 'Maria Silva',
      role: 'Membro',
      type: 'PJ',
      status: 'Ativo',
      isOwner: false,
      avatar: 'MS',
    },
    {
      id: 3,
      name: 'Pedro Silva (filho)',
      role: 'Dependente',
      type: null,
      status: null,
      age: 5,
      isOwner: false,
      avatar: '👶',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold">⚙️ Configurações da Família</h1>

      {/* Membros */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">👥 Membros</h2>

        {members.map((member) => (
          <div
            key={member.id}
            className={`bg-white rounded-lg p-5 shadow-sm border ${
              member.isOwner ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className={member.isOwner ? 'bg-[#3B82F6] text-white' : 'bg-gray-200'}>
                  {member.avatar}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      member.role === 'Owner'
                        ? 'bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white'
                        : member.role === 'Dependente'
                        ? 'bg-gray-200 text-gray-700'
                        : ''
                    }
                  >
                    {member.role}
                  </Badge>
                  {member.type && <Badge variant="secondary">{member.type}</Badge>}
                  {member.status && (
                    <Badge className="bg-[#10B981] hover:bg-[#10B981]/90 text-white">
                      {member.status}
                    </Badge>
                  )}
                  {member.age && <span className="text-sm text-gray-600">{member.age} anos</span>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {!member.isOwner && (
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB]">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="memberName">Nome completo</Label>
                <Input id="memberName" placeholder="Ex: Ana Silva" />
              </div>
              <div>
                <Label htmlFor="memberEmail">Email (opcional)</Label>
                <Input id="memberEmail" type="email" placeholder="ana@exemplo.com" />
              </div>
              <div>
                <Label>Tipo</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="memberType" value="adult" defaultChecked />
                    <span>Membro adulto</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="memberType" value="dependent" />
                    <span>Dependente</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddMemberOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB] flex-1">Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Divisão Padrão */}
      <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-5">💰 Divisão Padrão de Despesas</h2>
        <div className="bg-gray-50 rounded-lg p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">João Silva</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={joaoPercentage}
                  onChange={(e) => setJoaoPercentage(Number(e.target.value))}
                  className="w-16 text-center"
                />
                <span>%</span>
              </div>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] flex items-center justify-center"
                style={{ width: `${joaoPercentage}%` }}
              >
                <span className="text-sm text-white font-medium">{joaoPercentage}%</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Maria Silva</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={mariaPercentage}
                  onChange={(e) => setMariaPercentage(Number(e.target.value))}
                  className="w-16 text-center"
                />
                <span>%</span>
              </div>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#EC4899] flex items-center justify-center"
                style={{ width: `${mariaPercentage}%` }}
              >
                <span className="text-sm text-white font-medium">{mariaPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p
              className={`font-bold ${
                joaoPercentage + mariaPercentage === 100 ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              Total: {joaoPercentage + mariaPercentage}%{' '}
              {joaoPercentage + mariaPercentage === 100 ? '✅' : '❌'}
            </p>
            <p className="text-sm text-gray-600 mt-1">ℹ️ Usado como padrão em novas despesas</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4">
          Ajustar percentuais
        </Button>
      </section>

      {/* Preferências */}
      <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-5">🎨 Preferências</h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Label>Tema</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="theme" value="light" defaultChecked />
                <span>☀️ Claro</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="theme" value="dark" />
                <span>🌙 Escuro</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Moeda</Label>
            <select className="px-3 py-2 border rounded-lg">
              <option>R$ (BRL)</option>
              <option>$ (USD)</option>
              <option>€ (EUR)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Formato de data</Label>
            <select className="px-3 py-2 border rounded-lg">
              <option>DD/MM/AAAA</option>
              <option>MM/DD/AAAA</option>
              <option>AAAA-MM-DD</option>
            </select>
          </div>

          <div>
            <Label className="mb-3 block">Notificações</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Alertas de gastos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>Metas atingidas</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span>Newsletter semanal</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Conta e Segurança */}
      <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-5">🔒 Conta e Segurança</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Alterar senha</Button>
          <Button variant="outline">Exportar dados</Button>
          <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                Excluir conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="text-center py-6">
                <span className="text-6xl">⚠️</span>
                <h3 className="text-2xl font-bold mt-4 mb-3">Tem certeza?</h3>
                <div className="text-left space-y-2 mb-6">
                  <p className="font-bold">Esta ação é irreversível!</p>
                  <p>Todos os dados da família serão permanentemente deletados:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Rendas</li>
                    <li>Despesas</li>
                    <li>Investimentos</li>
                    <li>Reserva</li>
                    <li>Histórico</li>
                  </ul>
                </div>
                <div className="mb-6">
                  <Label htmlFor="deleteConfirm" className="text-sm">
                    Digite "EXCLUIR" para confirmar
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteAccountOpen(false);
                      setDeleteConfirmation('');
                    }}
                    className="flex-1 bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={deleteConfirmation !== 'EXCLUIR'}
                    className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white disabled:opacity-50"
                  >
                    Excluir permanentemente
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
