package calculation

import "math"

// EmergencyFundGoal representa o cálculo da reserva de emergência
type EmergencyFundGoal struct {
	TargetMonths       int     `json:"target_months"`
	MonthlyExpenses    int64   `json:"monthly_expenses_cents"`
	TargetAmount       int64   `json:"target_amount_cents"`
	CurrentAmount      int64   `json:"current_amount_cents"`
	RemainingAmount    int64   `json:"remaining_amount_cents"`
	MonthlyGoal        int64   `json:"monthly_goal_cents"`
	EstimatedMonths    int     `json:"estimated_months"`
	CompletionPercent  float64 `json:"completion_percent"`
}

// CalculateEmergencyFundGoal calcula a meta de reserva de emergência
func CalculateEmergencyFundGoal(
	targetMonths int,
	monthlyExpensesCents int64,
	currentAmountCents int64,
	monthlyGoalCents int64,
) EmergencyFundGoal {
	
	// Valor alvo = despesas mensais × meses desejados
	targetAmount := monthlyExpensesCents * int64(targetMonths)
	
	// Quanto falta
	remainingAmount := targetAmount - currentAmountCents
	if remainingAmount < 0 {
		remainingAmount = 0
	}
	
	// Meses estimados para atingir a meta
	estimatedMonths := 0
	if monthlyGoalCents > 0 && remainingAmount > 0 {
		estimatedMonths = int(math.Ceil(float64(remainingAmount) / float64(monthlyGoalCents)))
	}
	
	// Percentual de conclusão
	completionPercent := 0.0
	if targetAmount > 0 {
		completionPercent = (float64(currentAmountCents) / float64(targetAmount)) * 100.0
		if completionPercent > 100 {
			completionPercent = 100
		}
	}
	
	return EmergencyFundGoal{
		TargetMonths:      targetMonths,
		MonthlyExpenses:   monthlyExpensesCents,
		TargetAmount:      targetAmount,
		CurrentAmount:     currentAmountCents,
		RemainingAmount:   remainingAmount,
		MonthlyGoal:       monthlyGoalCents,
		EstimatedMonths:   estimatedMonths,
		CompletionPercent: completionPercent,
	}
}

// SuggestMonthlyGoal sugere um aporte mensal baseado em renda disponível
func SuggestMonthlyGoal(
	totalIncomeCents int64,
	totalExpensesCents int64,
	investmentsCents int64,
	targetMonths int,
	desiredMonthsToComplete int,
) int64 {
	
	// Renda disponível = renda - despesas - investimentos
	availableIncome := totalIncomeCents - totalExpensesCents - investmentsCents
	
	if availableIncome <= 0 {
		return 0
	}
	
	// Meta total
	targetAmount := totalExpensesCents * int64(targetMonths)
	
	// Aporte mensal necessário
	if desiredMonthsToComplete > 0 {
		monthlyGoal := targetAmount / int64(desiredMonthsToComplete)
		
		// Limitar a 30% da renda disponível (boas práticas)
		maxSafeGoal := int64(float64(availableIncome) * 0.3)
		
		if monthlyGoal > maxSafeGoal {
			return maxSafeGoal
		}
		
		return monthlyGoal
	}
	
	// Padrão: 10-20% da renda disponível
	return int64(float64(availableIncome) * 0.15)
}

// CalculateEmergencyFundProjection projeta o crescimento da reserva
func CalculateEmergencyFundProjection(
	currentAmountCents int64,
	monthlyGoalCents int64,
	targetAmountCents int64,
	months int,
) []struct {
	Month   int   `json:"month"`
	Balance int64 `json:"balance_cents"`
	IsComplete bool `json:"is_complete"`
} {
	
	balance := currentAmountCents
	var projection []struct {
		Month      int   `json:"month"`
		Balance    int64 `json:"balance_cents"`
		IsComplete bool  `json:"is_complete"`
	}
	
	for month := 1; month <= months; month++ {
		if balance < targetAmountCents {
			balance += monthlyGoalCents
			if balance > targetAmountCents {
				balance = targetAmountCents
			}
		}
		
		projection = append(projection, struct {
			Month      int   `json:"month"`
			Balance    int64 `json:"balance_cents"`
			IsComplete bool  `json:"is_complete"`
		}{
			Month:      month,
			Balance:    balance,
			IsComplete: balance >= targetAmountCents,
		})
	}
	
	return projection
}
