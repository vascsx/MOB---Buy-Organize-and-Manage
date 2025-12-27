package calculation

import "math"

// ProjectionPoint representa um ponto na projeção
type ProjectionPoint struct {
	Month              int     `json:"month"`
	Balance            int64   `json:"balance_cents"`
	TotalContributed   int64   `json:"total_contributed_cents"`
	TotalReturns       int64   `json:"total_returns_cents"`
	BalanceFormatted   float64 `json:"balance"`
}

// ProjectionResult contém os resultados da projeção de investimento
type ProjectionResult struct {
	CurrentBalance int64             `json:"current_balance_cents"`
	Projections    []ProjectionPoint `json:"projections"`
	Summary        ProjectionSummary `json:"summary"`
}

// ProjectionSummary resume os principais marcos
type ProjectionSummary struct {
	OneYear   ProjectionPoint `json:"one_year"`
	ThreeYears ProjectionPoint `json:"three_years"`
	FiveYears  ProjectionPoint `json:"five_years"`
}

// CalculateInvestmentProjection projeta crescimento de investimento com juros compostos
func CalculateInvestmentProjection(
	currentBalanceCents int64,
	monthlyContributionCents int64,
	annualReturnRate float64,
	months int,
) ProjectionResult {
	
	// Taxa mensal de retorno (juros compostos)
	monthlyRate := math.Pow(1+(annualReturnRate/100.0), 1.0/12.0) - 1
	
	balance := float64(currentBalanceCents)
	totalContributed := float64(0)
	totalReturns := float64(0)
	
	var projections []ProjectionPoint
	
	for month := 1; month <= months; month++ {
		// Rendimento do mês
		monthlyReturn := balance * monthlyRate
		
		// Aporte do mês
		contribution := float64(monthlyContributionCents)
		
		// Novo saldo
		balance = balance + monthlyReturn + contribution
		totalContributed += contribution
		totalReturns += monthlyReturn
		
		projections = append(projections, ProjectionPoint{
			Month:            month,
			Balance:          int64(math.Round(balance)),
			TotalContributed: int64(math.Round(totalContributed)),
			TotalReturns:     int64(math.Round(totalReturns)),
			BalanceFormatted: balance / 100.0,
		})
	}
	
	// Extrair marcos principais
	summary := ProjectionSummary{}
	if len(projections) >= 12 {
		summary.OneYear = projections[11] // mês 12
	}
	if len(projections) >= 36 {
		summary.ThreeYears = projections[35] // mês 36
	}
	if len(projections) >= 60 {
		summary.FiveYears = projections[59] // mês 60
	}
	
	return ProjectionResult{
		CurrentBalance: currentBalanceCents,
		Projections:    projections,
		Summary:        summary,
	}
}

// CalculateMultipleInvestmentsProjection projeta múltiplos investimentos
func CalculateMultipleInvestmentsProjection(
	investments []struct {
		CurrentBalanceCents      int64
		MonthlyContributionCents int64
		AnnualReturnRate         float64
	},
	months int,
) ProjectionResult {
	
	// Agregar todos os investimentos
	totalCurrentBalance := int64(0)
	for _, inv := range investments {
		totalCurrentBalance += inv.CurrentBalanceCents
	}
	
	// Array para armazenar soma de todos os investimentos por mês
	combinedBalances := make([]int64, months)
	combinedContributions := make([]int64, months)
	combinedReturns := make([]int64, months)
	
	// Calcular cada investimento separadamente
	for _, inv := range investments {
		monthlyRate := math.Pow(1+(inv.AnnualReturnRate/100.0), 1.0/12.0) - 1
		balance := float64(inv.CurrentBalanceCents)
		totalContributed := float64(0)
		totalReturns := float64(0)
		
		for month := 0; month < months; month++ {
			monthlyReturn := balance * monthlyRate
			contribution := float64(inv.MonthlyContributionCents)
			
			balance = balance + monthlyReturn + contribution
			totalContributed += contribution
			totalReturns += monthlyReturn
			
			combinedBalances[month] += int64(math.Round(balance))
			combinedContributions[month] += int64(math.Round(totalContributed))
			combinedReturns[month] += int64(math.Round(totalReturns))
		}
	}
	
	// Montar resultado
	var projections []ProjectionPoint
	for month := 0; month < months; month++ {
		projections = append(projections, ProjectionPoint{
			Month:            month + 1,
			Balance:          combinedBalances[month],
			TotalContributed: combinedContributions[month],
			TotalReturns:     combinedReturns[month],
			BalanceFormatted: float64(combinedBalances[month]) / 100.0,
		})
	}
	
	// Extrair marcos
	summary := ProjectionSummary{}
	if len(projections) >= 12 {
		summary.OneYear = projections[11]
	}
	if len(projections) >= 36 {
		summary.ThreeYears = projections[35]
	}
	if len(projections) >= 60 {
		summary.FiveYears = projections[59]
	}
	
	return ProjectionResult{
		CurrentBalance: totalCurrentBalance,
		Projections:    projections,
		Summary:        summary,
	}
}
