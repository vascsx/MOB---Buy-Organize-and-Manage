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
func (s *EmergencyFundService) CreateOrUpdateEmergencyFund(familyID uint, targetMonths int, monthlyExpenses float64, monthlyGoal float64) (*models.EmergencyFund, error) {
	// Validações
	validator := utils.NewValidator()
	validator.Add(utils.ValidateTargetMonths(targetMonths))
	validator.Add(utils.ValidatePositiveFloat(monthlyExpenses, "monthly_expenses"))
	validator.Add(utils.ValidatePositiveFloat(monthlyGoal, "monthly_goal"))

	if validator.HasErrors() {
		return nil, validator.GetErrors()
	}

	// Calcular valor alvo baseado no custo mensal informado pelo usuário
	targetAmount := monthlyExpenses * float64(targetMonths)

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
		fund.MonthlyExpenses = monthlyExpenses
		fund.TargetAmount = targetAmount
		fund.MonthlyGoal = monthlyGoal

		// Recalcular meses estimados
		s.calculateEstimatedMonths(fund)

		err = s.emergencyRepo.Update(fund)
		return fund, err

	} else {
		// Criar novo
		fund := &models.EmergencyFund{
			FamilyAccountID:      familyID,
			TargetMonths:         targetMonths,
			MonthlyExpenses:      monthlyExpenses,
			TargetAmount:         targetAmount,
			CurrentAmount:        0,
			MonthlyGoal:          monthlyGoal,
		}

		s.calculateEstimatedMonths(fund)

		err = s.emergencyRepo.Create(fund)
		return fund, err
	}
}

// UpdateCurrentAmount atualiza o valor atual da reserva
func (s *EmergencyFundService) UpdateCurrentAmount(familyID uint, newAmount float64) error {
	validator := utils.NewValidator()
	validator.Add(utils.ValidatePositiveFloat(newAmount, "current_amount"))
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	fund, err := s.emergencyRepo.GetByFamilyID(familyID)
	if err != nil {
		return err
	}
	fund.CurrentAmount = newAmount
	s.calculateEstimatedMonths(fund)
	return s.emergencyRepo.Update(fund)
}

// calculateEstimatedMonths calcula os meses necessários para atingir a meta
func (s *EmergencyFundService) calculateEstimatedMonths(fund *models.EmergencyFund) {
	remaining := fund.TargetAmount - fund.CurrentAmount
	if remaining <= 0 {
		fund.EstimatedMonths = 0
		return
	}
	if fund.MonthlyGoal <= 0 {
		fund.EstimatedMonths = 999 // Valor alto para indicar impossível
		return
	}
	fund.EstimatedMonths = int((remaining + fund.MonthlyGoal - 1) / fund.MonthlyGoal) // Arredondar para cima
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
	
	// Buscar aportes via despesas do tipo emergency_reserve
	emergencyExpensesTotal, err := s.expenseRepo.CalculateTotalByType(familyID, models.ExpenseTypeEmergencyReserve)
	if err != nil {
		emergencyExpensesTotal = 0 // Continuar mesmo com erro
	}
	
	// Converter centavos para reais e adicionar ao valor atual
	emergencyExpensesInReais := float64(emergencyExpensesTotal) / 100.0
	totalCurrentAmount := fund.CurrentAmount + emergencyExpensesInReais
	
	   // (Removido: cálculo de monthlyExpenses não é mais necessário)
	
	// Aqui, use os próprios campos do fund, pois já estão em reais
	return &EmergencyFundProgress{
		TargetMonths:      fund.TargetMonths,
		MonthlyExpenses:   fund.MonthlyExpenses,
		TargetAmount:      fund.TargetAmount,
		CurrentAmount:     totalCurrentAmount,
		RemainingAmount:   fund.TargetAmount - totalCurrentAmount,
		MonthlyGoal:       fund.MonthlyGoal,
		EstimatedMonths:   fund.EstimatedMonths,
		CompletionPercent: (totalCurrentAmount / fund.TargetAmount) * 100,
		IsComplete:        totalCurrentAmount >= fund.TargetAmount,
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
	
	// Projeção simplificada: apenas valores reais atuais
	details := []EmergencyFundProjectionDetail{}
	for i := 1; i <= months; i++ {
		balance := fund.CurrentAmount + float64(i)*fund.MonthlyGoal
		details = append(details, EmergencyFundProjectionDetail{
			Month:      i,
			Balance:    balance,
			IsComplete: balance >= fund.TargetAmount,
		})
	}
	return &EmergencyFundProjectionResponse{
		CurrentAmount:  fund.CurrentAmount,
		TargetAmount:   fund.TargetAmount,
		MonthlyGoal:    fund.MonthlyGoal,
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
