package controllers

import (
	"finance-backend/services"
	"finance-backend/utils"
	"fmt"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	incomeService     *services.IncomeService
	expenseService    *services.ExpenseService
	investmentService *services.InvestmentService
	emergencyService  *services.EmergencyFundService
}

func NewDashboardController(
	incomeService *services.IncomeService,
	expenseService *services.ExpenseService,
	investmentService *services.InvestmentService,
	emergencyService *services.EmergencyFundService,
) *DashboardController {
	return &DashboardController{
		incomeService:     incomeService,
		expenseService:    expenseService,
		investmentService: investmentService,
		emergencyService:  emergencyService,
	}
}

// GetDashboard retorna visão consolidada da família
func (ctrl *DashboardController) GetDashboard(c *gin.Context) {
	familyID := c.GetUint("family_id")
	monthParam := c.Query("month") // Formato: YYYY-MM
	
	// Parsear mês/ano do query parameter
	month, year := 0, 0
	if monthParam != "" {
		// Formato esperado: YYYY-MM (ex: 2024-03)
		var parseErr error
		_, parseErr = fmt.Sscanf(monthParam, "%d-%d", &year, &month)
		if parseErr != nil || month < 1 || month > 12 || year < 2000 {
			utils.ErrorResponse(c, 400, "Formato de mês inválido. Use YYYY-MM (ex: 2024-03)")
			return
		}
	}
	
	// Buscar resumos com filtro de mês
	incomeSummary, _ := ctrl.incomeService.GetFamilyIncomeSummary(familyID, month, year)
	expensesSummary, _ := ctrl.expenseService.GetFamilyExpensesSummary(familyID, month, year)
	investmentsSummary, _ := ctrl.investmentService.GetInvestmentsSummary(familyID, month, year)
	
	// Reserva de emergência (pode não existir)
	emergencyProgress, errEmergency := ctrl.emergencyService.GetEmergencyFundProgress(familyID)
	
	// Calcular saldo disponível
	availableIncome := 0.0
	if incomeSummary != nil && expensesSummary != nil {
		availableIncome = incomeSummary.TotalNet - expensesSummary.TotalMonthly
		if investmentsSummary != nil {
			availableIncome -= investmentsSummary.TotalMonthly
		}
	}
	
	dashboard := map[string]interface{}{
		"income":      incomeSummary,
		"expenses":    expensesSummary,
		"investments": investmentsSummary,
		"available_income": availableIncome,
	}
	
	if errEmergency == nil && emergencyProgress != nil {
		dashboard["emergency_fund"] = emergencyProgress
	}
	
	// Status financeiro geral
	healthScore := ctrl.calculateFinancialHealth(incomeSummary, expensesSummary, investmentsSummary, emergencyProgress)
	dashboard["financial_health_score"] = healthScore
	
	// Gerar alertas
	alerts := ctrl.generateAlerts(incomeSummary, expensesSummary, investmentsSummary, emergencyProgress)
	dashboard["alerts"] = alerts
	
	utils.SuccessResponse(c, 200, dashboard)
}

// calculateFinancialHealth calcula score de saúde financeira (0-100)
func (ctrl *DashboardController) calculateFinancialHealth(
	income *services.FamilyIncomeSummary,
	expenses *services.ExpensesSummary,
	investments *services.InvestmentsSummaryResponse,
	emergency *services.EmergencyFundProgress,
) int {
	score := 0
	
	if income == nil || expenses == nil {
		return 0
	}
	
	// 1. Gastos < 70% da renda líquida (30 pontos)
	if income.TotalNet > 0 {
		expenseRatio := expenses.TotalMonthly / income.TotalNet
		if expenseRatio < 0.5 {
			score += 30
		} else if expenseRatio < 0.7 {
			score += 20
		} else if expenseRatio < 0.9 {
			score += 10
		}
	}
	
	// 2. Possui investimentos ativos (25 pontos)
	if investments != nil && investments.TotalMonthly > 0 {
		investmentRatio := investments.TotalMonthly / income.TotalNet
		if investmentRatio >= 0.2 { // 20% ou mais
			score += 25
		} else if investmentRatio >= 0.1 { // 10% ou mais
			score += 15
		} else {
			score += 5
		}
	}
	
	// 3. Reserva de emergência (25 pontos)
	if emergency != nil {
		if emergency.CompletionPercent >= 100 {
			score += 25
		} else if emergency.CompletionPercent >= 50 {
			score += 15
		} else if emergency.CompletionPercent > 0 {
			score += 5
		}
	}
	
	// 4. Saldo positivo (20 pontos)
	available := income.TotalNet - expenses.TotalMonthly
	if investments != nil {
		available -= investments.TotalMonthly
	}
	if available > 0 {
		score += 20
	}
	
	return score
}

// Alert representa um alerta do dashboard
type Alert struct {
	Type     string  `json:"type"`
	Category string  `json:"category"`
	Severity string  `json:"severity"` // "info", "warning", "critical"
	Title    string  `json:"title"`
	Message  string  `json:"message"`
	Value    float64 `json:"value,omitempty"`
}

// generateAlerts gera alertas baseados nos dados financeiros
func (ctrl *DashboardController) generateAlerts(
	income *services.FamilyIncomeSummary,
	expenses *services.ExpensesSummary,
	investments *services.InvestmentsSummaryResponse,
	emergency *services.EmergencyFundProgress,
) []Alert {
	alerts := []Alert{}
	
	if income == nil || expenses == nil {
		return alerts
	}
	
	// Alerta 1: Despesas excedem renda
	if expenses.TotalMonthly > income.TotalNet {
		expenseRatio := (expenses.TotalMonthly / income.TotalNet) * 100
		alerts = append(alerts, Alert{
			Type:     "high_expenses",
			Category: "high_expenses",
			Severity: "critical",
			Title:    "Despesas excedem a renda",
			Message:  "Suas despesas mensais estão maiores que sua renda líquida. É necessário reduzir gastos imediatamente.",
			Value:    expenseRatio,
		})
	} else {
		// Alerta 2: Despesas altas (>80% da renda)
		expenseRatio := (expenses.TotalMonthly / income.TotalNet) * 100
		if expenseRatio > 80 {
			alerts = append(alerts, Alert{
				Type:     "high_expenses",
				Category: "high_expenses",
				Severity: "warning",
				Title:    "Despesas muito altas",
				Message:  "Suas despesas representam mais de 80% da sua renda. Considere reduzir gastos.",
				Value:    expenseRatio,
			})
		} else if expenseRatio > 70 {
			alerts = append(alerts, Alert{
				Type:     "high_expenses",
				Category: "high_expenses",
				Severity: "info",
				Title:    "Atenção aos gastos",
				Message:  "Suas despesas estão acima de 70% da renda. Tente manter abaixo desse patamar.",
				Value:    expenseRatio,
			})
		}
	}
	
	// Alerta 3: Reserva de emergência
	if emergency == nil {
		alerts = append(alerts, Alert{
			Type:     "emergency_fund",
			Category: "emergency_fund",
			Severity: "warning",
			Title:    "Sem reserva de emergência",
			Message:  "Configure uma reserva de emergência de pelo menos 6 meses de despesas.",
			Value:    0,
		})
	} else if emergency.CompletionPercent < 100 {
		severity := "info"
		if emergency.CompletionPercent < 30 {
			severity = "warning"
		}
		alerts = append(alerts, Alert{
			Type:     "emergency_fund",
			Category: "emergency_fund",
			Severity: severity,
			Title:    "Reserva de emergência incompleta",
			Message:  "Continue construindo sua reserva de emergência.",
			Value:    emergency.CompletionPercent,
		})
	}
	
	// Alerta 4: Sem investimentos
	if investments == nil || investments.TotalMonthly == 0 {
		alerts = append(alerts, Alert{
			Type:     "investment",
			Category: "investment",
			Severity: "info",
			Title:    "Comece a investir",
			Message:  "Você ainda não tem investimentos. Considere investir pelo menos 10% da sua renda.",
			Value:    0,
		})
	} else {
		// Investimentos baixos
		investmentRatio := (investments.TotalMonthly / income.TotalNet) * 100
		if investmentRatio < 10 {
			alerts = append(alerts, Alert{
				Type:     "investment",
				Category: "investment",
				Severity: "info",
				Title:    "Investimentos baixos",
				Message:  "Tente aumentar seus investimentos para pelo menos 10% da renda.",
				Value:    investmentRatio,
			})
		}
	}
	
	// Alerta 5: Saldo negativo
	available := income.TotalNet - expenses.TotalMonthly
	if investments != nil {
		available -= investments.TotalMonthly
	}
	if available < 0 {
		alerts = append(alerts, Alert{
			Type:     "savings_goal",
			Category: "savings_goal",
			Severity: "critical",
			Title:    "Saldo negativo",
			Message:  "Suas despesas e investimentos excedem sua renda. Revise seu orçamento urgentemente.",
			Value:    available,
		})
	}
	
	return alerts
}
