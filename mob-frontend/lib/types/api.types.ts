/**
 * TypeScript Types para API
 * Espelham os modelos do backend Go
 */

// ===== AUTH =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// ===== FAMILY =====
export interface FamilyAccount {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: number;
  family_account_id: number;
  name: string;
  email?: string;
  role: 'owner' | 'member' | 'dependent';
  is_active: boolean;
  created_at: string;
}

export interface CreateFamilyRequest {
  name: string;
  members?: CreateMemberInput[];
}

export interface CreateMemberInput {
  name: string;
  email?: string;
  role: string;
}

// ===== INCOME =====
export type IncomeType = 'clt' | 'pj';

export interface Income {
  id: number;
  family_member_id: number;
  family_member?: FamilyMember;
  type: IncomeType;
  gross_monthly_cents: number;
  net_monthly_cents: number; // Salário líquido informado pelo usuário
  food_voucher_cents: number;
  transport_voucher_cents: number;
  bonus_cents: number;
  reference_month: number;
  reference_year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeBreakdown {
  income: Income;
  gross_amount: number; // em reais
  net_amount: number; // em reais
  total_tax: number; // em reais
  benefits: number; // em reais
  taxes: {
    INSS?: number; // em reais
    IRPF?: number; // em reais
    FGTS?: number; // em reais
    [key: string]: number | undefined;
  };
}

export interface IncomeSummary {
  total_gross: number;
  total_net: number;
  total_tax: number;
  total_inss?: number;
  total_irpf?: number;
  total_fgts?: number;
  members: MemberIncome[];
  member_incomes?: MemberIncome[]; // Deprecated, use members
}

export interface MemberIncome {
  member_id: number;
  member_name: string;
  type: IncomeType | string;
  gross: number;  // valor em reais
  net: number;    // valor em reais
  tax: number;    // valor em reais
}

export interface CreateIncomeRequest {
  family_member_id: number;
  type: IncomeType;
  net_monthly_cents: number;  // Campo principal - renda líquida
  gross_monthly_cents?: number;  // Opcional - renda bruta
  food_voucher_cents?: number;
  transport_voucher_cents?: number;
  bonus_cents?: number;
}

// ===== EXPENSE =====
export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface Expense {
  id: number;
  family_account_id: number;
  category_id: number;
  category?: ExpenseCategory;
  name: string;
  description?: string;
  amount_cents: number;
  due_day?: number;
  is_fixed: boolean;
  is_active: boolean;
  splits?: ExpenseSplit[];
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  family_member_id: number;
  family_member?: FamilyMember;
  percentage: number;
  amount_cents: number;
}

export interface ExpensesSummary {
  total_once: number;
  total_monthly: number;
  total_yearly: number;
  by_category: CategorySummary[];
  by_member: MemberExpense[];
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  total: number;
  count: number;
  percentage?: number;
}

export interface MemberExpense {
  member_id: number;
  member_name: string;
  total_cents: number;
  percentage: number;
}

export interface CreateExpenseRequest {
  category_id: number;
  name: string;
  description?: string;
  amount_cents: number;
  due_day?: number;
  is_fixed?: boolean;
  splits: ExpenseSplitInput[];
}

export interface ExpenseSplitInput {
  family_member_id: number;
  percentage: number;
}

// ===== INVESTMENT =====
export type InvestmentType = 'renda_fixa' | 'renda_variavel' | 'fundos' | 'crypto' | 'imoveis';

export interface Investment {
  id: number;
  family_account_id: number;
  name: string;
  type: InvestmentType;
  current_balance_cents: number;
  monthly_contribution_cents: number;
  annual_return_rate: number;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentsSummary {
  total_balance: number;  // Saldo total atual em reais
  total_monthly: number;  // Aporte mensal total em reais
  by_type: TypeSummary[];
}

export interface TypeSummary {
  type: string;
  total_cents: number;
  percentage: number;
}

// Projeção da reserva de emergência
export interface EmergencyFundProjection {
  current_amount: number;
  target_amount: number;
  monthly_goal: number;
  months_to_goal: number;
  projection: EmergencyFundProjectionDetail[];
}

export interface EmergencyFundProjectionDetail {
  month: number;
  balance: number;
  is_complete: boolean;
}

export interface CreateInvestmentRequest {
  name: string;
  type: InvestmentType;
  current_balance_cents: number;
  monthly_contribution_cents: number;
  annual_return_rate: number;
  start_date?: string;
}

// ===== INVESTMENT PROJECTION =====
export interface InvestmentProjection {
  investment_id?: number;
  name?: string;
  type?: InvestmentType;
  monthly_contribution?: number; // em reais
  current_balance?: number; // em reais
  annual_return_rate?: number;
  projections: Array<{
    month: number;
    balance_cents: number;
    total_contributed_cents: number;
    total_returns_cents: number;
    balance: number;
  }>;
  summary?: {
    one_year?: {
      month: number;
      balance_cents: number;
      total_contributed_cents: number;
      total_returns_cents: number;
      balance: number;
    };
    three_years?: {
      month: number;
      balance_cents: number;
      total_contributed_cents: number;
      total_returns_cents: number;
      balance: number;
    };
    five_years?: {
      month: number;
      balance_cents: number;
      total_contributed_cents: number;
      total_returns_cents: number;
      balance: number;
    };
  };
}

// ===== EMERGENCY FUND =====

export interface EmergencyFund {
  id: number;
  family_account_id: number;
  target_months: number;
  monthly_expenses: number; // em reais
  target_amount: number; // em reais
  current_amount: number; // em reais
  monthly_goal: number; // em reais
  estimated_months: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyFundProgress {
  target_months: number;
  monthly_expenses: number;  // em reais
  target_amount: number;  // em reais
  current_amount: number;  // em reais
  remaining_amount: number;  // em reais
  monthly_goal: number;  // em reais
  estimated_months: number;
  completion_percent: number;
  is_complete: boolean;
}

export interface EmergencyFundSuggestion {
  suggested_amount: number;  // em reais
  total_income: number;  // em reais
  total_expenses: number;  // em reais
  available_income: number;  // em reais
  percentage_of_income: number;
}

export interface CreateEmergencyFundRequest {
  target_months: number;
  monthly_expenses: number;
  monthly_goal: number;
}

// ===== DASHBOARD =====
export interface DashboardData {
  income: IncomeSummary;
  expenses: ExpensesSummary;
  investments: InvestmentsSummary;
  emergency_fund_progress?: EmergencyFundProgress;
  emergency_fund?: EmergencyFundProgress; // Suporte para backend que retorna emergency_fund
  available_income: number;
  financial_health_score: number;
  alerts?: Alert[];
}

export interface Alert {
  type: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  value?: number;
}

// ===== PAGINATION & FILTERS =====
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ExpenseFilters {
  category_id?: number;
  member_id?: number;
  is_active?: boolean;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

// ===== API RESPONSE WRAPPER =====
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}
