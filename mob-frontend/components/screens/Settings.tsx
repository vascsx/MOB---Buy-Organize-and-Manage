import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { useFamilies } from '../../hooks/useFamilies';
import { useAuth } from '../../hooks/useAuth';

// Translations
const translations = {
  'pt-BR': {
    title: '⚙️ Configurações da Família',
    noFamilySelected: 'Nenhuma família selecionada',
    members: 'Membros',
    addMember: 'Adicionar membro',
    editMember: 'Editar Membro',
    addMemberTitle: 'Adicionar Membro',
    fullName: 'Nome completo',
    emailOptional: 'Email (opcional)',
    type: 'Tipo',
    adultMember: 'Membro adulto',
    dependent: 'Dependente',
    cancel: 'Cancelar',
    add: 'Adicionar',
    adding: 'Adicionando...',
    save: 'Salvar',
    saving: 'Salvando...',
    edit: 'Editar',
    remove: 'Remover',
    you: '(Você)',
    owner: 'Owner',
    member: 'Membro',
    dependentRole: 'Dependente',
    active: 'Ativo',
    inactive: 'Inativo',
    expenseDivision: '💰 Divisão Padrão de Despesas',
    expenseDivisionDesc: 'Esta funcionalidade permite definir como as despesas serão divididas entre os membros adultos da família por padrão.',
    expenseDivisionInfo: 'ℹ️ A divisão de despesas é configurada individualmente em cada despesa criada.',
    preferences: '🎨 Preferências',
    language: 'Idioma',
    portuguese: '🇧🇷 Português',
    english: '🇺🇸 English',
    theme: 'Tema',
    light: '☀️ Claro',
    dark: '🌙 Escuro',
    notifications: 'Notificações',
    spendingAlerts: 'Alertas de gastos',
    goalsAchieved: 'Metas atingidas',
    weeklyNewsletter: 'Newsletter semanal',
    accountSecurity: '🔒 Conta e Segurança',
    deleteFamily: 'Excluir Família',
    areYouSure: 'Tem certeza?',
    irreversibleAction: 'Esta ação é irreversível!',
    allDataWillBeDeleted: 'Todos os dados da família "{name}" serão permanentemente deletados:',
    incomes: 'Rendas',
    expenses: 'Despesas',
    investments: 'Investimentos',
    emergencyFund: 'Reserva de emergência',
    completeHistory: 'Histórico completo',
    typeToConfirm: 'Digite "EXCLUIR" para confirmar',
    deletePermanently: 'Excluir permanentemente',
    deleting: 'Excluindo...',
    removeConfirm: 'Tem certeza que deseja remover este membro?',
    namePlaceholder: 'Ex: Ana Silva',
    emailPlaceholder: 'ana@exemplo.com',
  },
  'en-US': {
    title: '⚙️ Family Settings',
    noFamilySelected: 'No family selected',
    members: 'Members',
    addMember: 'Add member',
    editMember: 'Edit Member',
    addMemberTitle: 'Add Member',
    fullName: 'Full name',
    emailOptional: 'Email (optional)',
    type: 'Type',
    adultMember: 'Adult member',
    dependent: 'Dependent',
    cancel: 'Cancel',
    add: 'Add',
    adding: 'Adding...',
    save: 'Save',
    saving: 'Saving...',
    edit: 'Edit',
    remove: 'Remove',
    you: '(You)',
    owner: 'Owner',
    member: 'Member',
    dependentRole: 'Dependent',
    active: 'Active',
    inactive: 'Inactive',
    expenseDivision: '💰 Default Expense Division',
    expenseDivisionDesc: 'This feature allows you to define how expenses will be divided among adult family members by default.',
    expenseDivisionInfo: 'ℹ️ Expense division is configured individually for each expense created.',
    preferences: '🎨 Preferences',
    language: 'Language',
    portuguese: '🇧🇷 Português',
    english: '🇺🇸 English',
    theme: 'Theme',
    light: '☀️ Light',
    dark: '🌙 Dark',
    notifications: 'Notifications',
    spendingAlerts: 'Spending alerts',
    goalsAchieved: 'Goals achieved',
    weeklyNewsletter: 'Weekly newsletter',
    accountSecurity: '🔒 Account & Security',
    deleteFamily: 'Delete Family',
    areYouSure: 'Are you sure?',
    irreversibleAction: 'This action is irreversible!',
    allDataWillBeDeleted: 'All data for family "{name}" will be permanently deleted:',
    incomes: 'Incomes',
    expenses: 'Expenses',
    investments: 'Investments',
    emergencyFund: 'Emergency fund',
    completeHistory: 'Complete history',
    typeToConfirm: 'Type "DELETE" to confirm',
    deletePermanently: 'Delete permanently',
    deleting: 'Deleting...',
    removeConfirm: 'Are you sure you want to remove this member?',
    namePlaceholder: 'e.g., Ana Silva',
    emailPlaceholder: 'ana@example.com',
  },
};

export function Settings() {
  const { family, members: contextMembers, refreshFamily } = useFamilyContext();
  const { user } = useAuth();
  const { 
    members, 
    isLoading, 
    error, 
    fetchMembers, 
    addMember, 
    updateMember, 
    removeMember,
    deleteFamily 
  } = useFamilies();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [editingMember, setEditingMember] = useState<any>(null);
  const [language, setLanguage] = useState<'pt-BR' | 'en-US'>('pt-BR');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Form state for add member
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    role: 'member' as 'member' | 'dependent',
  });

  const t = translations[language];

  // Load members when family is available
  useEffect(() => {
    if (family) {
      fetchMembers(family.id);
    }
  }, [family, fetchMembers]);

  // Load saved preferences
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'pt-BR' | 'en-US';
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const handleLanguageChange = (newLanguage: 'pt-BR' | 'en-US') => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAddMember = async () => {
    if (!family || !newMemberForm.name) return;
    
    try {
      await addMember(family.id, {
        name: newMemberForm.name,
        email: newMemberForm.email || undefined,
        role: newMemberForm.role,
      });
      setIsAddMemberOpen(false);
      setNewMemberForm({ name: '', email: '', role: 'member' });
      await refreshFamily();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleUpdateMember = async () => {
    if (!family || !editingMember) return;
    
    try {
      await updateMember(family.id, editingMember.id, {
        name: editingMember.name,
        email: editingMember.email || undefined,
        role: editingMember.role,
      });
      setIsEditMemberOpen(false);
      setEditingMember(null);
      await refreshFamily();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!family) return;
    
    if (confirm(t.removeConfirm)) {
      try {
        await removeMember(family.id, memberId);
        await refreshFamily();
      } catch (err) {
        console.error('Failed to remove member:', err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!family) return;
    const confirmText = language === 'pt-BR' ? 'EXCLUIR' : 'DELETE';
    if (deleteConfirmation !== confirmText) return;
    
    try {
      await deleteFamily(family.id);
      setIsDeleteAccountOpen(false);
      setDeleteConfirmation('');
      // Redirect to login or families page
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete family:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return t.owner;
      case 'member':
        return t.member;
      case 'dependent':
        return t.dependentRole;
      default:
        return role;
    }
  };

  if (!family) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t.noFamilySelected}</p>
      </div>
    );
  }

  if (isLoading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-gray-600 mt-1">{family.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Membros */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">👥 {t.members} ({members.length})</h2>

        {members.map((member) => {
          const isOwner = member.role === 'owner';
          const isCurrentUser = user?.email === member.email;
          
          return (
            <div
              key={member.id}
              className={`bg-white rounded-lg p-5 shadow-sm border ${
                isOwner ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className={isOwner ? 'bg-[#3B82F6] text-white' : 'bg-gray-200'}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {member.name} {isCurrentUser && t.you}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={
                        isOwner
                          ? 'bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white'
                          : member.role === 'dependent'
                          ? 'bg-gray-200 text-gray-700'
                          : ''
                      }
                    >
                      {getRoleBadge(member.role)}
                    </Badge>
                    <Badge className={member.is_active ? 'bg-[#10B981] hover:bg-[#10B981]/90 text-white' : 'bg-gray-400 text-white'}>
                      {member.is_active ? t.active : t.inactive}
                    </Badge>
                    {member.email && <span className="text-sm text-gray-600">{member.email}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingMember(member);
                      setIsEditMemberOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    {t.edit}
                  </Button>
                  {!isOwner && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t.remove}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB]">
              <Plus className="w-5 h-5 mr-2" />
              {t.addMember}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.addMemberTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="memberName">{t.fullName}</Label>
                <Input 
                  id="memberName" 
                  placeholder={t.namePlaceholder}
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="memberEmail">{t.emailOptional}</Label>
                <Input 
                  id="memberEmail" 
                  type="email" 
                  placeholder={t.emailPlaceholder}
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>{t.type}</Label>
                <Select
                  value={newMemberForm.role}
                  onValueChange={(value: 'member' | 'dependent') => setNewMemberForm({ ...newMemberForm, role: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">{t.adultMember}</SelectItem>
                    <SelectItem value="dependent">{t.dependent}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddMemberOpen(false);
                    setNewMemberForm({ name: '', email: '', role: 'member' });
                  }} 
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB] flex-1"
                  onClick={handleAddMember}
                  disabled={!newMemberForm.name || isLoading}
                >
                  {isLoading ? t.adding : t.add}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Member Modal */}
        <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editMember}</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="editMemberName">{t.fullName}</Label>
                  <Input 
                    id="editMemberName" 
                    placeholder={t.namePlaceholder}
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editMemberEmail">{t.emailOptional}</Label>
                  <Input 
                    id="editMemberEmail" 
                    type="email" 
                    placeholder={t.emailPlaceholder}
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t.type}</Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">{t.owner}</SelectItem>
                      <SelectItem value="member">{t.member}</SelectItem>
                      <SelectItem value="dependent">{t.dependentRole}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditMemberOpen(false);
                      setEditingMember(null);
                    }} 
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                  <Button 
                    className="bg-[#3B82F6] hover:bg-[#2563EB] flex-1"
                    onClick={handleUpdateMember}
                    disabled={!editingMember.name || isLoading}
                  >
                    {isLoading ? t.saving : t.save}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>

      {/* Divisão Padrão */}
      <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-3">{t.expenseDivision}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t.expenseDivisionDesc}
        </p>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            {t.expenseDivisionInfo}
          </p>
        </div>
      </section>

      {/* Preferências */}
      <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-5">{t.preferences}</h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Label>{t.language}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="language" 
                  value="pt-BR" 
                  checked={language === 'pt-BR'}
                  onChange={() => handleLanguageChange('pt-BR')}
                />
                <span>{t.portuguese}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="language" 
                  value="en-US" 
                  checked={language === 'en-US'}
                  onChange={() => handleLanguageChange('en-US')}
                />
                <span>{t.english}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>{t.theme}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="light" 
                  checked={theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                />
                <span>{t.light}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="theme" 
                  value="dark" 
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                />
                <span>{t.dark}</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">{t.notifications}</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>{t.spendingAlerts}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked />
                <span>{t.goalsAchieved}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span>{t.weeklyNewsletter}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Conta e Segurança */}
      <section className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-5">{t.accountSecurity}</h2>
        <div className="flex flex-wrap gap-3">
          <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                {t.deleteFamily}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div className="text-center py-6">
                <span className="text-6xl">⚠️</span>
                <h3 className="text-2xl font-bold mt-4 mb-3">{t.areYouSure}</h3>
                <div className="text-left space-y-2 mb-6">
                  <p className="font-bold">{t.irreversibleAction}</p>
                  <p>{t.allDataWillBeDeleted.replace('{name}', family.name)}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>{t.members} ({members.length})</li>
                    <li>{t.incomes}</li>
                    <li>{t.expenses}</li>
                    <li>{t.investments}</li>
                    <li>{t.emergencyFund}</li>
                    <li>{t.completeHistory}</li>
                  </ul>
                </div>
                <div className="mb-6">
                  <Label htmlFor="deleteConfirm" className="text-sm">
                    {t.typeToConfirm}
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
                    {t.cancel}
                  </Button>
                  <Button
                    disabled={deleteConfirmation !== (language === 'pt-BR' ? 'EXCLUIR' : 'DELETE') || isLoading}
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white disabled:opacity-50"
                  >
                    {isLoading ? t.deleting : t.deletePermanently}
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
