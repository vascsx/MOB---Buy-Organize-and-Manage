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
  food_voucher_cents: number;
  transport_voucher_cents: number;
  bonus_cents: number;
  simples_nacional_rate?: number;
  pro_labore_cents?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncomeBreakdown {
  gross_monthly_cents: number;
  net_monthly_cents: number;
  inss_cents: number;
  irpf_cents: number;
  fgts_cents: number;
  food_voucher_cents: number;
  transport_voucher_cents: number;
  bonus_cents: number;
  inss_rate: number;
  irpf_rate: number;
}

export interface IncomeSummary {
  total_gross: number;
  total_net: number;
  total_inss: number;
  total_irpf: number;
  total_fgts: number;
  member_incomes: MemberIncome[];
}

export interface MemberIncome {
  member_id: number;
  member_name: string;
  type: IncomeType;
  gross_monthly_cents: number;
  net_monthly_cents: number;
  is_active: boolean;
}

export interface CreateIncomeRequest {
  family_member_id: number;
  type: IncomeType;
  gross_monthly_cents: number;
  food_voucher_cents?: number;
  transport_voucher_cents?: number;
  bonus_cents?: number;
  simples_nacional_rate?: number;
  pro_labore_cents?: number;
}

// ===== EXPENSE =====
export type ExpenseFrequency = 'once' | 'monthly' | 'yearly';

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
  frequency: ExpenseFrequency;
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
  total_cents: number;
  percentage: number;
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
  frequency?: ExpenseFrequency;
  due_day?: number;
  is_fixed?: boolean;
  splits: ExpenseSplitInput[];
}

export interface ExpenseSplitInput {
  family_member_id: number;
  percentage: number;
}

// ===== INVESTMENT =====
export interface Investment {
  id: number;
  family_account_id: number;
  name: string;
  type: string;
  current_amount_cents: number;
  monthly_contribution_cents: number;
  annual_return_rate: number;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentsSummary {
  total_invested: number;
  total_monthly: number;
  by_type: TypeSummary[];
}

export interface TypeSummary {
  type: string;
  total_cents: number;
  percentage: number;
}

export interface InvestmentProjection {
  investment_id: number;
  investment_name: string;
  current_amount_cents: number;
  monthly_contribution_cents: number;
  annual_return_rate: number;
  projection_months: number;
  monthly_projections: MonthlyProjection[];
  final_amount_cents: number;
  total_invested_cents: number;
  total_return_cents: number;
}

export interface MonthlyProjection {
  month: number;
  amount_cents: number;
  invested_cents: number;
  return_cents: number;
}

export interface CreateInvestmentRequest {
  name: string;
  type: string;
  current_amount_cents: number;
  monthly_contribution_cents: number;
  annual_return_rate: number;
  start_date?: string;
}

// ===== EMERGENCY FUND =====
export interface EmergencyFund {
  id: number;
  family_account_id: number;
  target_months: number;
  current_amount_cents: number;
  monthly_contribution_cents: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyFundProgress {
  fund?: EmergencyFund;
  target_amount_cents: number;
  current_amount_cents: number;
  percentage_complete: number;
  months_to_complete: number;
  estimated_completion_date: string;
  monthly_expenses_average: number;
}

export interface EmergencyFundSuggestion {
  suggested_target_months: number;
  suggested_monthly_contribution_cents: number;
  available_income_cents: number;
  suggestion_percentage: number;
}

export interface CreateEmergencyFundRequest {
  target_months: number;
  current_amount_cents?: number;
  monthly_contribution_cents?: number;
}

// ===== DASHBOARD =====
export interface DashboardData {
  income_summary: IncomeSummary;
  expenses_summary: ExpensesSummary;
  investments_summary: InvestmentsSummary;
  emergency_fund_progress?: EmergencyFundProgress;
  available_income: number;
  financial_health_score: number;
  alerts: Alert[];
}

export interface Alert {
  type: 'warning' | 'success' | 'info' | 'error';
  message: string;
  category?: string;
}

// ===== PAGINATION & FILTERS =====
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ExpenseFilters {
  category_id?: number;
  member_id?: number;
  frequency?: ExpenseFrequency;
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
