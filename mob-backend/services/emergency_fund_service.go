package services

import (
	"finance-backend/models"
	"finance-backend/repositories"
	"finance-backend/services/calculation"
	"finance-backend/utils"
)

type EmergencyFundService struct {
	emergencyRepo *repositories.EmergencyFundRepository
	expenseRepo   *repositories.ExpenseRepository
	incomeRepo    *repositories.IncomeRepository
}

func NewEmergencyFundService(
	emergencyRepo *repositories.EmergencyFundRepository,
	expenseRepo *repositories.ExpenseRepository,
	incomeRepo *repositories.IncomeRepository,
) *EmergencyFundService {
	return &EmergencyFundService{
		emergencyRepo: emergencyRepo,
		expenseRepo:   expenseRepo,
		incomeRepo:    incomeRepo,
	}
}

// CreateOrUpdateEmergencyFund cria ou atualiza a reserva de emergência
func (s *EmergencyFundService) CreateOrUpdateEmergencyFund(familyID uint, targetMonths int, monthlyGoalCents int64) (*models.EmergencyFund, error) {
	// Validações
	validator := utils.NewValidator()
	validator.Add(utils.ValidateTargetMonths(targetMonths))
	validator.Add(utils.ValidatePositiveAmount(monthlyGoalCents, "monthly_goal_cents"))
	
	if validator.HasErrors() {
		return nil, validator.GetErrors()
	}
	
	// Calcular despesas mensais totais
	totalExpenses, err := s.expenseRepo.CalculateTotalMonthlyExpenses(familyID)
	if err != nil {
		return nil, err
	}
	
	// Calcular valor alvo
	targetAmount := totalExpenses * int64(targetMonths)
	
	// Verificar se já existe
	exists, err := s.emergencyRepo.Exists(familyID)
	if err != nil {
		return nil, err
	}
	
	if exists {
		// Atualizar existente
		fund, err := s.emergencyRepo.GetByFamilyID(familyID)
		if err != nil {
			return nil, err
		}
		
		fund.TargetMonths = targetMonths
		fund.TargetAmountCents = targetAmount
		fund.MonthlyGoalCents = monthlyGoalCents
		
		// Recalcular meses estimados
		s.calculateEstimatedMonths(fund)
		
		err = s.emergencyRepo.Update(fund)
		return fund, err
		
	} else {
		// Criar novo
		fund := &models.EmergencyFund{
			FamilyAccountID:    familyID,
			TargetMonths:       targetMonths,
			TargetAmountCents:  targetAmount,
			CurrentAmountCents: 0,
			MonthlyGoalCents:   monthlyGoalCents,
		}
		
		s.calculateEstimatedMonths(fund)
		
		err = s.emergencyRepo.Create(fund)
		return fund, err
	}
}

// UpdateCurrentAmount atualiza o valor atual da reserva
func (s *EmergencyFundService) UpdateCurrentAmount(familyID uint, newAmountCents int64) error {
	validator := utils.NewValidator()
	validator.Add(utils.ValidateNonNegativeAmount(newAmountCents, "current_amount_cents"))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	fund, err := s.emergencyRepo.GetByFamilyID(familyID)
	if err != nil {
		return err
	}
	
	fund.CurrentAmountCents = newAmountCents
	s.calculateEstimatedMonths(fund)
	
	return s.emergencyRepo.Update(fund)
}

// calculateEstimatedMonths calcula os meses necessários para atingir a meta
func (s *EmergencyFundService) calculateEstimatedMonths(fund *models.EmergencyFund) {
	remaining := fund.TargetAmountCents - fund.CurrentAmountCents
	
	if remaining <= 0 {
		fund.EstimatedMonths = 0
		return
	}
	
	if fund.MonthlyGoalCents <= 0 {
		fund.EstimatedMonths = 999 // Valor alto para indicar impossível
		return
	}
	
	fund.EstimatedMonths = int((remaining + fund.MonthlyGoalCents - 1) / fund.MonthlyGoalCents) // Arredondar para cima
}

// GetEmergencyFund busca a reserva de emergência
func (s *EmergencyFundService) GetEmergencyFund(familyID uint) (*models.EmergencyFund, error) {
	return s.emergencyRepo.GetByFamilyID(familyID)
}

// GetEmergencyFundProgress retorna o progresso detalhado da reserva
func (s *EmergencyFundService) GetEmergencyFundProgress(familyID uint) (*EmergencyFundProgress, error) {
	fund, err := s.emergencyRepo.GetByFamilyID(familyID)
	if err != nil {
		return nil, err
	}
	
	// Calcular despesas mensais
	monthlyExpenses, err := s.expenseRepo.CalculateTotalMonthlyExpenses(familyID)
	if err != nil {
		return nil, err
	}
	
	goal := calculation.CalculateEmergencyFundGoal(
		fund.TargetMonths,
		monthlyExpenses,
		fund.CurrentAmountCents,
		fund.MonthlyGoalCents,
	)
	
	return &EmergencyFundProgress{
		TargetMonths:       goal.TargetMonths,
		MonthlyExpenses:    utils.CentsToFloat(goal.MonthlyExpenses),
		TargetAmount:       utils.CentsToFloat(goal.TargetAmount),
		CurrentAmount:      utils.CentsToFloat(goal.CurrentAmount),
		RemainingAmount:    utils.CentsToFloat(goal.RemainingAmount),
		MonthlyGoal:        utils.CentsToFloat(goal.MonthlyGoal),
		EstimatedMonths:    goal.EstimatedMonths,
		CompletionPercent:  goal.CompletionPercent,
		IsComplete:         goal.CompletionPercent >= 100,
	}, nil
}

// SuggestMonthlyGoal sugere um aporte mensal baseado na renda disponível
func (s *EmergencyFundService) SuggestMonthlyGoal(familyID uint, targetMonths, desiredMonthsToComplete int) (*MonthlyGoalSuggestion, error) {
	// Calcular renda total
	totalIncome, err := s.incomeRepo.CalculateTotalFamilyIncome(familyID)
	if err != nil {
		return nil, err
	}
	
	// Calcular despesas totais
	totalExpenses, err := s.expenseRepo.CalculateTotalMonthlyExpenses(familyID)
	if err != nil {
		return nil, err
	}
	
	// Assumir que investimentos representam 15% da renda (estimativa)
	// TODO: buscar investimentos reais quando disponível
	estimatedInvestments := int64(float64(totalIncome) * 0.15)
	
	suggestedGoal := calculation.SuggestMonthlyGoal(
		totalIncome,
		totalExpenses,
		estimatedInvestments,
		targetMonths,
		desiredMonthsToComplete,
	)
	
	availableIncome := totalIncome - totalExpenses - estimatedInvestments
	percentageOfIncome := 0.0
	if availableIncome > 0 {
		percentageOfIncome = (float64(suggestedGoal) / float64(availableIncome)) * 100
	}
	
	return &MonthlyGoalSuggestion{
		SuggestedAmount:    utils.CentsToFloat(suggestedGoal),
		TotalIncome:        utils.CentsToFloat(totalIncome),
		TotalExpenses:      utils.CentsToFloat(totalExpenses),
		AvailableIncome:    utils.CentsToFloat(availableIncome),
		PercentageOfIncome: percentageOfIncome,
	}, nil
}

// GetEmergencyFundProjection retorna a projeção de crescimento da reserva
func (s *EmergencyFundService) GetEmergencyFundProjection(familyID uint, months int) (*EmergencyFundProjectionResponse, error) {
	fund, err := s.emergencyRepo.GetByFamilyID(familyID)
	if err != nil {
		return nil, err
	}
	
	projection := calculation.CalculateEmergencyFundProjection(
		fund.CurrentAmountCents,
		fund.MonthlyGoalCents,
		fund.TargetAmountCents,
		months,
	)
	
	details := []EmergencyFundProjectionDetail{}
	for _, p := range projection {
		details = append(details, EmergencyFundProjectionDetail{
			Month:      p.Month,
			Balance:    utils.CentsToFloat(p.Balance),
			IsComplete: p.IsComplete,
		})
	}
	
	return &EmergencyFundProjectionResponse{
		CurrentAmount:  utils.CentsToFloat(fund.CurrentAmountCents),
		TargetAmount:   utils.CentsToFloat(fund.TargetAmountCents),
		MonthlyGoal:    utils.CentsToFloat(fund.MonthlyGoalCents),
		MonthsToGoal:   fund.EstimatedMonths,
		Projection:     details,
	}, nil
}

// DeleteEmergencyFund exclui a reserva de emergência
func (s *EmergencyFundService) DeleteEmergencyFund(familyID uint) error {
	return s.emergencyRepo.Delete(familyID)
}

// Structs de resposta

type EmergencyFundProgress struct {
	TargetMonths      int     `json:"target_months"`
	MonthlyExpenses   float64 `json:"monthly_expenses"`
	TargetAmount      float64 `json:"target_amount"`
	CurrentAmount     float64 `json:"current_amount"`
	RemainingAmount   float64 `json:"remaining_amount"`
	MonthlyGoal       float64 `json:"monthly_goal"`
	EstimatedMonths   int     `json:"estimated_months"`
	CompletionPercent float64 `json:"completion_percent"`
	IsComplete        bool    `json:"is_complete"`
}

type MonthlyGoalSuggestion struct {
	SuggestedAmount    float64 `json:"suggested_amount"`
	TotalIncome        float64 `json:"total_income"`
	TotalExpenses      float64 `json:"total_expenses"`
	AvailableIncome    float64 `json:"available_income"`
	PercentageOfIncome float64 `json:"percentage_of_income"`
}

type EmergencyFundProjectionResponse struct {
	CurrentAmount float64                         `json:"current_amount"`
	TargetAmount  float64                         `json:"target_amount"`
	MonthlyGoal   float64                         `json:"monthly_goal"`
	MonthsToGoal  int                             `json:"months_to_goal"`
	Projection    []EmergencyFundProjectionDetail `json:"projection"`
}

type EmergencyFundProjectionDetail struct {
	Month      int     `json:"month"`
	Balance    float64 `json:"balance"`
	IsComplete bool    `json:"is_complete"`
}
