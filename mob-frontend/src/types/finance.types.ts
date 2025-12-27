// Finance Domain Types

export type IncomeType = 'CLT' | 'PJ';
export type MemberRole = 'owner' | 'member' | 'dependent';
export type ExpenseFrequency = 'once' | 'monthly' | 'yearly';
export type InvestmentType = 'cdb' | 'tesouro_direto' | 'fundo_investimento' | 'acao' | 'outro';

export interface FamilyAccount {
  id: number;
  name: string;
  owner_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: number;
  family_account_id: number;
  user_id?: number;
  name: string;
  role: MemberRole;
  birth_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Income {
  id: number;
  family_member_id: number;
  type: IncomeType;
  gross_monthly_cents: number;
  net_monthly_cents: number;
  inss_cents: number;
  fgts_cents: number;
  irpf_cents: number;
  simples_cents: number;
  benefits_monthly_cents: number;
  has_dependents: boolean;
  num_dependents: number;
  simples_rate?: number;
  is_active: boolean;
  created_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: number;
  family_account_id: number;
  category_id: number;
  description: string;
  amount_cents: number;
  frequency: ExpenseFrequency;
  due_day?: number;
  is_active: boolean;
  created_at: string;
  category?: ExpenseCategory;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  family_member_id: number;
  percentage: number;
  amount_cents: number;
  member?: FamilyMember;
}

export interface Investment {
  id: number;
  family_account_id: number;
  type: InvestmentType;
  description: string;
  current_balance_cents: number;
  monthly_contribution_cents: number;
  annual_return_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface EmergencyFund {
  id: number;
  family_account_id: number;
  target_months: number;
  target_amount_cents: number;
  current_amount_cents: number;
  monthly_goal_cents: number;
  estimated_months: number;
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface DashboardSummary {
  family_id: number;
  total_income_cents: number;
  total_expenses_cents: number;
  available_balance_cents: number;
  total_investments_cents: number;
  emergency_fund_cents: number;
  emergency_fund_progress: number;
  financial_health_score: number;
}

export interface FinancialHealthDetail {
  score: number;
  category: string;
  breakdown: {
    expense_ratio_score: number;
    investment_score: number;
    emergency_fund_score: number;
    positive_balance_score: number;
  };
  recommendations: string[];
}

// Income Summary
export interface IncomeSummary {
  total_gross_cents: number;
  total_net_cents: number;
  total_benefits_cents: number;
  total_taxes_cents: number;
  incomes_count: number;
}

export interface IncomeBreakdown {
  income_id: number;
  gross_monthly_cents: number;
  net_monthly_cents: number;
  inss_cents: number;
  fgts_cents: number;
  irpf_cents: number;
  simples_cents: number;
  benefits_monthly_cents: number;
}

// Expense Summary
export interface ExpenseSummary {
  total_monthly_cents: number;
  total_yearly_cents: number;
  expenses_count: number;
  by_category: {
    category_id: number;
    category_name: string;
    total_cents: number;
    percentage: number;
  }[];
}

// Investment Projection
export interface ProjectionPoint {
  month: number;
  balance_cents: number;
  total_invested_cents: number;
}

export interface InvestmentProjection {
  investment_id: number;
  years: number;
  total_invested_cents: number;
  final_balance_cents: number;
  total_earnings_cents: number;
  projections: ProjectionPoint[];
}

// Emergency Fund Progress
export interface EmergencyFundProgress {
  target_months: number;
  target_amount_cents: number;
  current_amount_cents: number;
  percentage_complete: number;
  remaining_cents: number;
  monthly_goal_cents: number;
  estimated_months: number;
}
