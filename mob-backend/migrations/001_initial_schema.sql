-- Migration: Initial schema for Family Finance Organizer
-- Date: 2025-12-26

-- =====================================================
-- USERS (já existe, mas adicionando campos)
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- FAMILY ACCOUNTS (conta familiar - multi-tenant)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_family_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_family_accounts_owner ON family_accounts(owner_user_id);

-- =====================================================
-- FAMILY MEMBERS (membros da família)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_members (
    id SERIAL PRIMARY KEY,
    family_account_id INTEGER NOT NULL,
    user_id INTEGER, -- nullable para dependentes
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- owner, member, dependent
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_member_family FOREIGN KEY (family_account_id) REFERENCES family_accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_family_members_family_account ON family_members(family_account_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);

-- =====================================================
-- INCOMES (rendas individuais)
-- =====================================================
CREATE TABLE IF NOT EXISTS incomes (
    id SERIAL PRIMARY KEY,
    family_member_id INTEGER NOT NULL,
    type VARCHAR(10) NOT NULL, -- CLT, PJ
    
    -- Valores em centavos
    gross_monthly_cents BIGINT NOT NULL,
    food_voucher_cents BIGINT DEFAULT 0,
    transport_voucher_cents BIGINT DEFAULT 0,
    bonus_cents BIGINT DEFAULT 0,
    
    -- Para PJ
    simples_nacional_rate DECIMAL(5,2) DEFAULT 0,
    pro_labore_cents BIGINT DEFAULT 0,
    
    -- Para CLT (calculado)
    inss_cents BIGINT DEFAULT 0,
    fgts_cents BIGINT DEFAULT 0,
    irpf_cents BIGINT DEFAULT 0,
    
    -- Líquido
    net_monthly_cents BIGINT DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_income_member FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
    CONSTRAINT chk_income_type CHECK (type IN ('CLT', 'PJ'))
);

CREATE INDEX idx_incomes_family_member ON incomes(family_member_id);
CREATE INDEX idx_incomes_active ON incomes(is_active);

-- =====================================================
-- EXPENSE CATEGORIES (categorias de despesas)
-- =====================================================
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE
);

-- Inserir categorias padrão
INSERT INTO expense_categories (name, icon, color, is_default) VALUES
    ('Moradia', '🏠', '#3B82F6', TRUE),
    ('Alimentação', '🍽️', '#10B981', TRUE),
    ('Transporte', '🚗', '#F59E0B', TRUE),
    ('Saúde', '🏥', '#EF4444', TRUE),
    ('Educação', '📚', '#8B5CF6', TRUE),
    ('Lazer', '🎮', '#EC4899', TRUE),
    ('Vestuário', '👔', '#6366F1', TRUE),
    ('Utilidades', '💡', '#14B8A6', TRUE),
    ('Outros', '📦', '#6B7280', TRUE)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- EXPENSES (despesas)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    family_account_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount_cents BIGINT NOT NULL,
    frequency VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly, one_time
    due_day INTEGER DEFAULT 1,
    is_fixed BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_expense_family FOREIGN KEY (family_account_id) REFERENCES family_accounts(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES expense_categories(id),
    CONSTRAINT chk_expense_frequency CHECK (frequency IN ('monthly', 'yearly', 'one_time')),
    CONSTRAINT chk_due_day CHECK (due_day BETWEEN 1 AND 31)
);

CREATE INDEX idx_expenses_family_account ON expenses(family_account_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_active ON expenses(is_active);

-- =====================================================
-- EXPENSE SPLITS (divisão de despesas entre membros)
-- =====================================================
CREATE TABLE IF NOT EXISTS expense_splits (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL,
    family_member_id INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL, -- ex: 50.00
    amount_cents BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_split_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_split_member FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
    CONSTRAINT chk_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

CREATE INDEX idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX idx_expense_splits_member ON expense_splits(family_member_id);

-- =====================================================
-- INVESTMENTS (investimentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    family_account_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL, -- renda_fixa, renda_variavel, fundos, crypto, imoveis
    monthly_contribution_cents BIGINT NOT NULL,
    current_balance_cents BIGINT DEFAULT 0,
    annual_return_rate DECIMAL(5,2) NOT NULL, -- ex: 10.50
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_investment_family FOREIGN KEY (family_account_id) REFERENCES family_accounts(id) ON DELETE CASCADE,
    CONSTRAINT chk_investment_type CHECK (type IN ('renda_fixa', 'renda_variavel', 'fundos', 'crypto', 'imoveis'))
);

CREATE INDEX idx_investments_family_account ON investments(family_account_id);
CREATE INDEX idx_investments_active ON investments(is_active);

-- =====================================================
-- EMERGENCY FUNDS (reserva de emergência)
-- =====================================================
CREATE TABLE IF NOT EXISTS emergency_funds (
    id SERIAL PRIMARY KEY,
    family_account_id INTEGER UNIQUE NOT NULL,
    target_months INTEGER NOT NULL,
    target_amount_cents BIGINT NOT NULL,
    current_amount_cents BIGINT DEFAULT 0,
    monthly_goal_cents BIGINT NOT NULL,
    estimated_months INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_emergency_family FOREIGN KEY (family_account_id) REFERENCES family_accounts(id) ON DELETE CASCADE,
    CONSTRAINT chk_target_months CHECK (target_months >= 3)
);

CREATE INDEX idx_emergency_funds_family_account ON emergency_funds(family_account_id);

-- =====================================================
-- PROJECTIONS (projeções financeiras)
-- =====================================================
CREATE TABLE IF NOT EXISTS projections (
    id SERIAL PRIMARY KEY,
    family_account_id INTEGER NOT NULL,
    projection_date TIMESTAMP NOT NULL,
    
    -- Valores em centavos
    total_income_cents BIGINT,
    total_expenses_cents BIGINT,
    investments_total_cents BIGINT,
    emergency_fund_cents BIGINT,
    net_worth_cents BIGINT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_projection_family FOREIGN KEY (family_account_id) REFERENCES family_accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_projections_family_account ON projections(family_account_id);
CREATE INDEX idx_projections_date ON projections(projection_date);
CREATE INDEX idx_projections_family_date ON projections(family_account_id, projection_date);

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_family_accounts_updated_at BEFORE UPDATE ON family_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_funds_updated_at BEFORE UPDATE ON emergency_funds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
