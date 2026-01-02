package services

import (
	"finance-backend/models"
	"finance-backend/repositories"
	"finance-backend/services/calculation"
	"finance-backend/utils"
)

type InvestmentService struct {
	investmentRepo *repositories.InvestmentRepository
	expenseRepo    *repositories.ExpenseRepository
}

func NewInvestmentService(
	investmentRepo *repositories.InvestmentRepository,
	expenseRepo *repositories.ExpenseRepository,
) *InvestmentService {
	return &InvestmentService{
		investmentRepo: investmentRepo,
		expenseRepo:    expenseRepo,
	}
}

// CreateInvestment cria um novo investimento
func (s *InvestmentService) CreateInvestment(investment *models.Investment) error {
	// Validações
	validator := utils.NewValidator()
	
	validator.Add(utils.ValidateRequiredString(investment.Name, "name"))
	validator.Add(utils.ValidateInvestmentType(string(investment.Type)))
	validator.Add(utils.ValidatePositiveAmount(investment.MonthlyContributionCents, "monthly_contribution_cents"))
	validator.Add(utils.ValidateNonNegativeAmount(investment.CurrentBalanceCents, "current_balance_cents"))
	validator.Add(utils.ValidateAnnualReturnRate(investment.AnnualReturnRate))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	return s.investmentRepo.Create(investment)
}

// UpdateInvestment atualiza um investimento
func (s *InvestmentService) UpdateInvestment(investment *models.Investment) error {
	// Validações
	validator := utils.NewValidator()
	
	validator.Add(utils.ValidateRequiredString(investment.Name, "name"))
	validator.Add(utils.ValidateInvestmentType(string(investment.Type)))
	validator.Add(utils.ValidatePositiveAmount(investment.MonthlyContributionCents, "monthly_contribution_cents"))
	validator.Add(utils.ValidateNonNegativeAmount(investment.CurrentBalanceCents, "current_balance_cents"))
	validator.Add(utils.ValidateAnnualReturnRate(investment.AnnualReturnRate))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	return s.investmentRepo.Update(investment)
}

// GetInvestmentByID busca investimento por ID
func (s *InvestmentService) GetInvestmentByID(id uint) (*models.Investment, error) {
	return s.investmentRepo.GetByID(id)
}

// GetInvestmentsByFamilyID busca investimentos de uma família
func (s *InvestmentService) GetInvestmentsByFamilyID(familyID uint) ([]models.Investment, error) {
	return s.investmentRepo.GetByFamilyID(familyID)
}

// GetInvestmentsByFamilyIDAndMonth busca investimentos de uma família filtrados por mês
func (s *InvestmentService) GetInvestmentsByFamilyIDAndMonth(familyID uint, month, year int) ([]models.Investment, error) {
	return s.investmentRepo.GetByFamilyIDAndMonth(familyID, month, year)
}

// DeleteInvestment desativa um investimento
func (s *InvestmentService) DeleteInvestment(id uint) error {
	return s.investmentRepo.Delete(id)
}

// GetInvestmentProjection calcula projeção de um investimento específico
func (s *InvestmentService) GetInvestmentProjection(investmentID uint, years int) (*InvestmentProjectionResponse, error) {
	investment, err := s.investmentRepo.GetByID(investmentID)
	if err != nil {
		return nil, err
	}
	
	months := years * 12
	
	projection := calculation.CalculateInvestmentProjection(
		investment.CurrentBalanceCents,
		investment.MonthlyContributionCents,
		investment.AnnualReturnRate,
		months,
	)
	
	return &InvestmentProjectionResponse{
		InvestmentName:  investment.Name,
		InvestmentType:  string(investment.Type),
		CurrentBalance:  utils.CentsToFloat(projection.CurrentBalance),
		YearsProjected:  years,
		Summary: ProjectionSummary{
			OneYear:   convertProjectionPoint(projection.Summary.OneYear),
			ThreeYears: convertProjectionPoint(projection.Summary.ThreeYears),
			FiveYears:  convertProjectionPoint(projection.Summary.FiveYears),
		},
		MonthlyDetails: convertProjectionPoints(projection.Projections),
	}, nil
}

// GetFamilyInvestmentsProjection calcula projeção consolidada de todos os investimentos
func (s *InvestmentService) GetFamilyInvestmentsProjection(familyID uint, years int) (*FamilyInvestmentProjectionResponse, error) {
	investments, err := s.investmentRepo.GetByFamilyID(familyID)
	if err != nil {
		return nil, err
	}
	
	if len(investments) == 0 {
		return &FamilyInvestmentProjectionResponse{
			TotalCurrentBalance: 0,
			TotalMonthlyContribution: 0,
			YearsProjected: years,
			Investments: []InvestmentInfo{},
		}, nil
	}
	
	// Preparar dados para cálculo consolidado
	investmentsData := []struct {
		CurrentBalanceCents      int64
		MonthlyContributionCents int64
		AnnualReturnRate         float64
	}{}
	
	totalCurrentBalance := int64(0)
	totalMonthlyContribution := int64(0)
	investmentsInfo := []InvestmentInfo{}
	
	for _, inv := range investments {
		investmentsData = append(investmentsData, struct {
			CurrentBalanceCents      int64
			MonthlyContributionCents int64
			AnnualReturnRate         float64
		}{
			CurrentBalanceCents:      inv.CurrentBalanceCents,
			MonthlyContributionCents: inv.MonthlyContributionCents,
			AnnualReturnRate:         inv.AnnualReturnRate,
		})
		
		totalCurrentBalance += inv.CurrentBalanceCents
		totalMonthlyContribution += inv.MonthlyContributionCents
		
		investmentsInfo = append(investmentsInfo, InvestmentInfo{
			ID:                inv.ID,
			Name:              inv.Name,
			Type:              string(inv.Type),
			CurrentBalance:    utils.CentsToFloat(inv.CurrentBalanceCents),
			MonthlyContribution: utils.CentsToFloat(inv.MonthlyContributionCents),
			AnnualReturnRate:  inv.AnnualReturnRate,
		})
	}
	
	months := years * 12
	projection := calculation.CalculateMultipleInvestmentsProjection(investmentsData, months)
	
	return &FamilyInvestmentProjectionResponse{
		TotalCurrentBalance:      utils.CentsToFloat(totalCurrentBalance),
		TotalMonthlyContribution: utils.CentsToFloat(totalMonthlyContribution),
		YearsProjected:           years,
		Investments:              investmentsInfo,
		Summary: ProjectionSummary{
			OneYear:    convertProjectionPoint(projection.Summary.OneYear),
			ThreeYears: convertProjectionPoint(projection.Summary.ThreeYears),
			FiveYears:  convertProjectionPoint(projection.Summary.FiveYears),
		},
		MonthlyDetails: convertProjectionPoints(projection.Projections),
	}, nil
}

// GetInvestmentsSummary retorna resumo dos investimentos
// Se month e year forem fornecidos (> 0), filtra por mês específico
func (s *InvestmentService) GetInvestmentsSummary(familyID uint, month, year int) (*InvestmentsSummaryResponse, error) {
	var investments []models.Investment
	var err error
	
	// Se month e year forem fornecidos, buscar por mês específico
	if month > 0 && year > 0 {
		investments, err = s.investmentRepo.GetByFamilyIDAndMonth(familyID, month, year)
	} else {
		investments, err = s.investmentRepo.GetByFamilyID(familyID)
	}
	
	if err != nil {
		return nil, err
	}
	
	// Buscar aportes via despesas do tipo investment
	investmentExpensesTotal, err := s.expenseRepo.CalculateTotalByType(familyID, models.ExpenseTypeInvestment)
	if err != nil {
		investmentExpensesTotal = 0 // Continuar mesmo com erro
	}
	
	// Calcular totais
	totalBalance := int64(0)
	totalMonthly := int64(0)
	byTypeMap := make(map[models.InvestmentType]*InvestmentByType)
	
	for _, inv := range investments {
		totalBalance += inv.CurrentBalanceCents
		totalMonthly += inv.MonthlyContributionCents
		
		// Agrupar por tipo
		if _, exists := byTypeMap[inv.Type]; !exists {
			byTypeMap[inv.Type] = &InvestmentByType{
				Type:              string(inv.Type),
				Count:             0,
				TotalBalance:      0,
				TotalMonthly:      0,
				AverageReturnRate: 0,
			}
		}
		
		byTypeMap[inv.Type].Count++
		byTypeMap[inv.Type].TotalBalance += utils.CentsToFloat(inv.CurrentBalanceCents)
		byTypeMap[inv.Type].TotalMonthly += utils.CentsToFloat(inv.MonthlyContributionCents)
		byTypeMap[inv.Type].AverageReturnRate += inv.AnnualReturnRate
	}
	
	// Adicionar aportes via despesas ao total mensal
	totalMonthly += investmentExpensesTotal
	
	// Calcular média de retorno
	byType := []InvestmentByType{}
	for _, bt := range byTypeMap {
		if bt.Count > 0 {
			bt.AverageReturnRate = bt.AverageReturnRate / float64(bt.Count)
		}
		byType = append(byType, *bt)
	}
	
	return &InvestmentsSummaryResponse{
		TotalBalance:  utils.CentsToFloat(totalBalance),
		TotalMonthly:  utils.CentsToFloat(totalMonthly),
		ByType:        byType,
	}, nil
}

// Structs de resposta

type InvestmentProjectionResponse struct {
	InvestmentName   string              `json:"investment_name"`
	InvestmentType   string              `json:"investment_type"`
	CurrentBalance   float64             `json:"current_balance"`
	YearsProjected   int                 `json:"years_projected"`
	Summary          ProjectionSummary   `json:"summary"`
	MonthlyDetails   []ProjectionDetail  `json:"monthly_details"`
}

type FamilyInvestmentProjectionResponse struct {
	TotalCurrentBalance      float64             `json:"total_current_balance"`
	TotalMonthlyContribution float64             `json:"total_monthly_contribution"`
	YearsProjected           int                 `json:"years_projected"`
	Investments              []InvestmentInfo    `json:"investments"`
	Summary                  ProjectionSummary   `json:"summary"`
	MonthlyDetails           []ProjectionDetail  `json:"monthly_details"`
}

type InvestmentInfo struct {
	ID                  uint    `json:"id"`
	Name                string  `json:"name"`
	Type                string  `json:"type"`
	CurrentBalance      float64 `json:"current_balance"`
	MonthlyContribution float64 `json:"monthly_contribution"`
	AnnualReturnRate    float64 `json:"annual_return_rate"`
}

type ProjectionSummary struct {
	OneYear    ProjectionDetail `json:"one_year"`
	ThreeYears ProjectionDetail `json:"three_years"`
	FiveYears  ProjectionDetail `json:"five_years"`
}

type ProjectionDetail struct {
	Month            int     `json:"month"`
	Balance          float64 `json:"balance"`
	TotalContributed float64 `json:"total_contributed"`
	TotalReturns     float64 `json:"total_returns"`
}

type InvestmentsSummaryResponse struct {
	TotalBalance float64             `json:"total_balance"`
	TotalMonthly float64             `json:"total_monthly"`
	ByType       []InvestmentByType  `json:"by_type"`
}

type InvestmentByType struct {
	Type              string  `json:"type"`
	Count             int     `json:"count"`
	TotalBalance      float64 `json:"total_balance"`
	TotalMonthly      float64 `json:"total_monthly"`
	AverageReturnRate float64 `json:"average_return_rate"`
}

// Helper functions

func convertProjectionPoint(p calculation.ProjectionPoint) ProjectionDetail {
	return ProjectionDetail{
		Month:            p.Month,
		Balance:          utils.CentsToFloat(p.Balance),
		TotalContributed: utils.CentsToFloat(p.TotalContributed),
		TotalReturns:     utils.CentsToFloat(p.TotalReturns),
	}
}

func convertProjectionPoints(points []calculation.ProjectionPoint) []ProjectionDetail {
	details := []ProjectionDetail{}
	for _, p := range points {
		details = append(details, convertProjectionPoint(p))
	}
	return details
}
