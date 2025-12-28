package services

import (
	"errors"
	"finance-backend/models"
	"finance-backend/repositories"
	"finance-backend/utils"
)

type ExpenseService struct {
	expenseRepo  *repositories.ExpenseRepository
	familyRepo   *repositories.FamilyRepository
	categoryRepo *repositories.ExpenseCategoryRepository
}

func NewExpenseService(
	expenseRepo *repositories.ExpenseRepository,
	familyRepo *repositories.FamilyRepository,
	categoryRepo *repositories.ExpenseCategoryRepository,
) *ExpenseService {
	return &ExpenseService{
		expenseRepo:  expenseRepo,
		familyRepo:   familyRepo,
		categoryRepo: categoryRepo,
	}
}

// CreateExpense cria uma nova despesa com divisão entre membros
func (s *ExpenseService) CreateExpense(expense *models.Expense, splits []ExpenseSplitInput) error {
	// Validações
	validator := utils.NewValidator()
	
	validator.Add(utils.ValidateRequiredString(expense.Name, "name"))
	validator.Add(utils.ValidatePositiveAmount(expense.AmountCents, "amount_cents"))
	validator.Add(utils.ValidateExpenseFrequency(string(expense.Frequency)))
	validator.Add(utils.ValidateDueDay(expense.DueDay))
	
	if len(splits) == 0 {
		validator.AddError(utils.ValidationError{
			Field:   "splits",
			Message: "pelo menos um membro deve ser incluído",
		})
	}
	
	// Validar splits
	splitsForValidation := make([]struct {
		FamilyMemberID uint
		Percentage     float64
	}, len(splits))
	
	for i, split := range splits {
		splitsForValidation[i] = struct {
			FamilyMemberID uint
			Percentage     float64
		}{
			FamilyMemberID: split.FamilyMemberID,
			Percentage:     split.Percentage,
		}
	}
	
	validator.Add(utils.ValidateExpenseSplits(splitsForValidation))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	// Verificar se categoria existe
	_, err := s.categoryRepo.GetByID(expense.CategoryID)
	if err != nil {
		return errors.New("categoria não encontrada")
	}
	
	// Validar que todos os membros pertencem à mesma família
	for _, split := range splits {
		belongs, err := s.familyRepo.MemberBelongsToFamily(split.FamilyMemberID, expense.FamilyAccountID)
		if err != nil {
			return err
		}
		if !belongs {
			return errors.New("membro não pertence a esta família")
		}
	}
	
	// Criar despesa
	err = s.expenseRepo.Create(expense)
	if err != nil {
		return err
	}
	
	// Criar splits
	return s.createExpenseSplits(expense.ID, expense.AmountCents, splits)
}

// UpdateExpense atualiza uma despesa e recalcula splits
func (s *ExpenseService) UpdateExpense(expense *models.Expense, splits []ExpenseSplitInput) error {
	// Validações
	validator := utils.NewValidator()
	
	validator.Add(utils.ValidateRequiredString(expense.Name, "name"))
	validator.Add(utils.ValidatePositiveAmount(expense.AmountCents, "amount_cents"))
	validator.Add(utils.ValidateExpenseFrequency(string(expense.Frequency)))
	validator.Add(utils.ValidateDueDay(expense.DueDay))
	
	// Validar splits
	splitsForValidation := make([]struct {
		FamilyMemberID uint
		Percentage     float64
	}, len(splits))
	
	for i, split := range splits {
		splitsForValidation[i] = struct {
			FamilyMemberID uint
			Percentage     float64
		}{
			FamilyMemberID: split.FamilyMemberID,
			Percentage:     split.Percentage,
		}
	}
	
	validator.Add(utils.ValidateExpenseSplits(splitsForValidation))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	// Validar que todos os membros pertencem à mesma família
	for _, split := range splits {
		belongs, err := s.familyRepo.MemberBelongsToFamily(split.FamilyMemberID, expense.FamilyAccountID)
		if err != nil {
			return err
		}
		if !belongs {
			return errors.New("membro não pertence a esta família")
		}
	}
	
	// Usar transação para garantir atomicidade
	return s.expenseRepo.UpdateWithTransaction(func(repo *repositories.ExpenseRepository) error {
		// Atualizar despesa
		err := repo.Update(expense)
		if err != nil {
			return err
		}
		
		// Recriar splits
		err = repo.DeleteSplitsByExpenseID(expense.ID)
		if err != nil {
			return err
		}
		
		return s.createExpenseSplitsInTx(repo, expense.ID, expense.AmountCents, splits)
	})
}

// createExpenseSplits cria as divisões de uma despesa
func (s *ExpenseService) createExpenseSplits(expenseID uint, totalAmountCents int64, splits []ExpenseSplitInput) error {
	for _, split := range splits {
		// Calcular valor baseado na porcentagem
		amountCents := utils.CalculatePercentage(totalAmountCents, split.Percentage)
		
		expenseSplit := &models.ExpenseSplit{
			ExpenseID:      expenseID,
			FamilyMemberID: split.FamilyMemberID,
			Percentage:     split.Percentage,
			AmountCents:    amountCents,
		}
		
		err := s.expenseRepo.CreateSplit(expenseSplit)
		if err != nil {
			return err
		}
	}
	
	return nil
}

// createExpenseSplitsInTx cria splits dentro de uma transação
func (s *ExpenseService) createExpenseSplitsInTx(repo *repositories.ExpenseRepository, expenseID uint, totalAmountCents int64, splits []ExpenseSplitInput) error {
	for _, split := range splits {
		// Calcular valor baseado na porcentagem
		amountCents := utils.CalculatePercentage(totalAmountCents, split.Percentage)
		
		expenseSplit := &models.ExpenseSplit{
			ExpenseID:      expenseID,
			FamilyMemberID: split.FamilyMemberID,
			Percentage:     split.Percentage,
			AmountCents:    amountCents,
		}
		
		err := repo.CreateSplit(expenseSplit)
		if err != nil {
			return err
		}
	}
	
	return nil
}

// ExpenseSplitInput representa a entrada de divisão de despesa
type ExpenseSplitInput struct {
	FamilyMemberID uint    `json:"family_member_id"`
	Percentage     float64 `json:"percentage"`
}

// GetExpenseByID busca despesa por ID
func (s *ExpenseService) GetExpenseByID(id uint) (*models.Expense, error) {
	return s.expenseRepo.GetByID(id)
}

// GetExpensesByFamilyID busca despesas de uma família
func (s *ExpenseService) GetExpensesByFamilyID(familyID uint) ([]models.Expense, error) {
	return s.expenseRepo.GetByFamilyID(familyID)
}

// DeleteExpense desativa uma despesa
func (s *ExpenseService) DeleteExpense(id uint) error {
	return s.expenseRepo.Delete(id)
}

// GetExpensesByCategory retorna despesas agrupadas por categoria
func (s *ExpenseService) GetExpensesByCategory(familyID uint) (*ExpenseByCategoryResponse, error) {
	results, err := s.expenseRepo.GetExpensesByCategory(familyID)
	if err != nil {
		return nil, err
	}
	
	categories := []CategoryExpense{}
	totalCents := int64(0)
	
	for _, result := range results {
		categories = append(categories, CategoryExpense{
			CategoryID:   result.CategoryID,
			CategoryName: result.CategoryName,
			Total:        utils.CentsToFloat(result.TotalCents),
			Count:        int(result.Count),
		})
		totalCents += result.TotalCents
	}
	
	return &ExpenseByCategoryResponse{
		Categories: categories,
		TotalAmount: utils.CentsToFloat(totalCents),
	}, nil
}

type ExpenseByCategoryResponse struct {
	Categories  []CategoryExpense `json:"categories"`
	TotalAmount float64           `json:"total_amount"`
}

type CategoryExpense struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	Total        float64 `json:"total"`
	Count        int     `json:"count"`
}

// GetMemberExpenses retorna despesas de um membro específico
func (s *ExpenseService) GetMemberExpenses(memberID uint) (*MemberExpensesResponse, error) {
	splits, err := s.expenseRepo.GetSplitsByMember(memberID)
	if err != nil {
		return nil, err
	}
	
	expenses := []MemberExpenseDetail{}
	totalCents := int64(0)
	
	for _, split := range splits {
		if split.Expense.IsActive {
			expenses = append(expenses, MemberExpenseDetail{
				ExpenseID:    split.ExpenseID,
				ExpenseName:  split.Expense.Name,
				CategoryName: split.Expense.Category.Name,
				TotalAmount:  utils.CentsToFloat(split.Expense.AmountCents),
				MemberAmount: utils.CentsToFloat(split.AmountCents),
				Percentage:   split.Percentage,
			})
			totalCents += split.AmountCents
		}
	}
	
	return &MemberExpensesResponse{
		Expenses:    expenses,
		TotalAmount: utils.CentsToFloat(totalCents),
	}, nil
}

type MemberExpensesResponse struct {
	Expenses    []MemberExpenseDetail `json:"expenses"`
	TotalAmount float64               `json:"total_amount"`
}

type MemberExpenseDetail struct {
	ExpenseID    uint    `json:"expense_id"`
	ExpenseName  string  `json:"expense_name"`
	CategoryName string  `json:"category_name"`
	TotalAmount  float64 `json:"total_amount"`
	MemberAmount float64 `json:"member_amount"`
	Percentage   float64 `json:"percentage"`
}

// GetFamilyExpensesSummary retorna resumo completo das despesas
// Se month e year forem fornecidos (> 0), filtra por mês específico
func (s *ExpenseService) GetFamilyExpensesSummary(familyID uint, month, year int) (*ExpensesSummary, error) {
	var expenses []models.Expense
	var err error
	
	// Se month e year forem fornecidos, buscar por mês específico
	if month > 0 && year > 0 {
		expenses, err = s.expenseRepo.GetByFamilyIDAndMonth(familyID, month, year)
	} else {
		expenses, err = s.expenseRepo.GetByFamilyID(familyID)
	}
	
	if err != nil {
		return nil, err
	}
	
	// Calcular totais
	totalMonthly := 0.0
	fixedCount := 0
	variableCount := 0
	categoryTotals := make(map[string]float64)
	
	for _, exp := range expenses {
		amountFloat := float64(exp.AmountCents) / 100.0
		totalMonthly += amountFloat
		
		if exp.IsFixed {
			fixedCount++
		} else {
			variableCount++
		}
		
		// Agrupar por categoria
		if exp.Category.Name != "" {
			categoryTotals[exp.Category.Name] += amountFloat
		}
	}
	
	// Construir by_category
	byCategory := []CategorySummary{}
	if totalMonthly > 0 {
		for catName, catTotal := range categoryTotals {
			percentage := (catTotal / totalMonthly) * 100
			byCategory = append(byCategory, CategorySummary{
				CategoryName: catName,
				Total:        catTotal,
				Percentage:   percentage,
			})
		}
	}
	
	return &ExpensesSummary{
		TotalMonthly:   totalMonthly,
		TotalYearly:    totalMonthly * 12,
		TotalOnce:      0, // TODO: calcular one_time se necessário
		FixedCount:     fixedCount,
		VariableCount:  variableCount,
		ByCategory:     byCategory,
	}, nil
}
		TotalMonthly:  utils.CentsToFloat(totalMonthly),
		FixedCount:    fixedCount,
		VariableCount: variableCount,
		ByCategory:    byCategory.Categories,
	}, nil
}

type ExpensesSummary struct {
	TotalMonthly  float64           `json:"total_monthly"`
	FixedCount    int               `json:"fixed_count"`
	VariableCount int               `json:"variable_count"`
	ByCategory    []CategoryExpense `json:"by_category"`
}

// GetAllCategories retorna todas as categorias
func (s *ExpenseService) GetAllCategories() ([]models.ExpenseCategory, error) {
	return s.categoryRepo.GetAll()
}

// GetDefaultCategories retorna categorias padrão
func (s *ExpenseService) GetDefaultCategories() ([]models.ExpenseCategory, error) {
	return s.categoryRepo.GetDefaults()
}
