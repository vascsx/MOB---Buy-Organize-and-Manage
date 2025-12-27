-- Migration: Performance Optimization Indexes
-- Date: 2025-12-27
-- Description: Adiciona índices compostos para otimizar queries mais comuns

-- =====================================================
-- ÍNDICES COMPOSTOS PARA OTIMIZAÇÃO
-- =====================================================

-- Family Members: buscar membros ativos de uma família (query muito comum)
CREATE INDEX IF NOT EXISTS idx_family_members_family_active 
ON family_members(family_account_id, is_active) 
WHERE is_active = TRUE;

-- Incomes: buscar rendas ativas por membro (usado em GetActiveByMemberID)
CREATE INDEX IF NOT EXISTS idx_incomes_member_active 
ON incomes(family_member_id, is_active) 
WHERE is_active = TRUE;

-- Incomes: otimizar agregação de renda total por família
CREATE INDEX IF NOT EXISTS idx_incomes_member_net 
ON incomes(family_member_id, net_monthly_cents) 
WHERE is_active = TRUE;

-- Expenses: buscar despesas ativas de uma família (query muito comum no dashboard)
CREATE INDEX IF NOT EXISTS idx_expenses_family_active 
ON expenses(family_account_id, is_active) 
WHERE is_active = TRUE;

-- Expenses: filtrar por categoria dentro de uma família
CREATE INDEX IF NOT EXISTS idx_expenses_family_category 
ON expenses(family_account_id, category_id, is_active);

-- Expenses: otimizar cálculo de despesas mensais
CREATE INDEX IF NOT EXISTS idx_expenses_family_frequency 
ON expenses(family_account_id, frequency, is_active) 
WHERE is_active = TRUE;

-- Expense Splits: buscar splits por despesa (usado ao carregar expense com splits)
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense 
ON expense_splits(expense_id);

-- Expense Splits: buscar splits por membro (para relatórios por pessoa)
CREATE INDEX IF NOT EXISTS idx_expense_splits_member 
ON expense_splits(family_member_id);

-- Investments: buscar investimentos ativos de uma família
CREATE INDEX IF NOT EXISTS idx_investments_family_active 
ON investments(family_account_id, is_active) 
WHERE is_active = TRUE;

-- Emergency Fund: busca única por família (já tem unique constraint, mas índice ajuda)
CREATE INDEX IF NOT EXISTS idx_emergency_funds_family 
ON emergency_funds(family_account_id);

-- =====================================================
-- ÍNDICES PARA QUERIES DE AGREGAÇÃO
-- =====================================================

-- Otimizar SUM de despesas mensais por família
CREATE INDEX IF NOT EXISTS idx_expenses_sum_monthly 
ON expenses(family_account_id, amount_cents) 
WHERE is_active = TRUE AND frequency = 'monthly';

-- Otimizar SUM de renda líquida por família (via join)
-- Coberto por índice existente + índice composto acima

-- =====================================================
-- STATISTICS E ANÁLISE
-- =====================================================

-- Atualizar estatísticas do PostgreSQL para melhor query planning
ANALYZE family_accounts;
ANALYZE family_members;
ANALYZE incomes;
ANALYZE expenses;
ANALYZE expense_splits;
ANALYZE investments;
ANALYZE emergency_funds;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON INDEX idx_family_members_family_active IS 'Otimiza busca de membros ativos por família';
COMMENT ON INDEX idx_incomes_member_active IS 'Otimiza busca de rendas ativas por membro';
COMMENT ON INDEX idx_expenses_family_active IS 'Otimiza busca de despesas ativas por família - query mais comum';
COMMENT ON INDEX idx_expenses_family_frequency IS 'Otimiza cálculo de despesas mensais vs anuais';
