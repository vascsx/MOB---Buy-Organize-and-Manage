package controllers

import (
	"finance-backend/models"
	"finance-backend/services"
	"finance-backend/utils"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ExpenseController struct {
	expenseService *services.ExpenseService
}

func NewExpenseController(expenseService *services.ExpenseService) *ExpenseController {
	return &ExpenseController{expenseService: expenseService}
}

// CreateExpense cria uma nova despesa
func (ctrl *ExpenseController) CreateExpense(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	var input struct {
		CategoryID  uint                         `json:"category_id"`
		Name        string                       `json:"name"`
		Description string                       `json:"description"`
		AmountCents int64                        `json:"amount_cents"`
		Frequency   string                       `json:"frequency"`
		ExpenseType string                       `json:"expense_type"`
		DueDay      int                          `json:"due_day"`
		IsFixed     bool                         `json:"is_fixed"`
		Splits      []services.ExpenseSplitInput `json:"splits"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	expense := &models.Expense{
		FamilyAccountID: familyID,
		CategoryID:      input.CategoryID,
		Name:            input.Name,
		Description:     input.Description,
		AmountCents:     input.AmountCents,
		Frequency:       models.ExpenseFrequency(input.Frequency),
		ExpenseType:     models.ExpenseType(input.ExpenseType),
		DueDay:          input.DueDay,
		IsFixed:         input.IsFixed,
		IsActive:        true,
	}
	
	err := ctrl.expenseService.CreateExpense(expense, input.Splits)
	if err != nil {
		// Se for erro de validação, retornar detalhes
		if validationErr, ok := err.(utils.ValidationErrors); ok {
			utils.ValidationErrorResponse(c, validationErr)
			return
		}
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 201, "Despesa criada com sucesso", expense)
}

// GetExpense busca despesa por ID
func (ctrl *ExpenseController) GetExpense(c *gin.Context) {
	expenseID, _ := strconv.ParseUint(c.Param("expenseId"), 10, 32)
	
	expense, err := ctrl.expenseService.GetExpenseByID(uint(expenseID))
	if err != nil {
		utils.NotFoundResponse(c, "Despesa")
		return
	}
	
	utils.SuccessResponse(c, 200, expense)
}

// GetFamilyExpenses busca despesas de uma família
func (ctrl *ExpenseController) GetFamilyExpenses(c *gin.Context) {
	familyID := c.GetUint("family_id")
	monthParam := c.Query("month") // Formato: YYYY-MM
	
	// Parsear mês/ano do query parameter
	month, year := 0, 0
	if monthParam != "" {
		var parseErr error
		_, parseErr = fmt.Sscanf(monthParam, "%d-%d", &year, &month)
		if parseErr != nil || month < 1 || month > 12 || year < 2000 {
			utils.ErrorResponse(c, 400, "Formato de mês inválido. Use YYYY-MM (ex: 2024-03)")
			return
		}
	}
	
	var expenses []models.Expense
	var err error
	if month > 0 && year > 0 {
		// Quando há filtro de mês, usar o repositório diretamente
		expenses, err = ctrl.expenseService.GetExpensesByFamilyIDAndMonth(familyID, month, year)
	} else {
		expenses, err = ctrl.expenseService.GetExpensesByFamilyID(familyID)
	}
	
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar despesas")
		return
	}
	
	utils.SuccessResponse(c, 200, expenses)
}

// GetExpensesByCategory retorna despesas agrupadas por categoria
func (ctrl *ExpenseController) GetExpensesByCategory(c *gin.Context) {
	familyID := c.GetUint("family_id")
	monthParam := c.Query("month") // Formato: YYYY-MM
	
	// Parsear mês/ano do query parameter
	month, year := 0, 0
	if monthParam != "" {
		var parseErr error
		_, parseErr = fmt.Sscanf(monthParam, "%d-%d", &year, &month)
		if parseErr != nil || month < 1 || month > 12 || year < 2000 {
			utils.ErrorResponse(c, 400, "Formato de mês inválido. Use YYYY-MM (ex: 2024-03)")
			return
		}
	}
	
	result, err := ctrl.expenseService.GetExpensesByCategory(familyID, month, year)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao agrupar despesas")
		return
	}
	
	utils.SuccessResponse(c, 200, result)
}

// GetExpensesSummary retorna resumo das despesas
func (ctrl *ExpenseController) GetExpensesSummary(c *gin.Context) {
	familyID := c.GetUint("family_id")
	monthParam := c.Query("month") // Formato: YYYY-MM
	
	// Parsear mês/ano do query parameter
	month, year := 0, 0
	if monthParam != "" {
		var parseErr error
		_, parseErr = fmt.Sscanf(monthParam, "%d-%d", &year, &month)
		if parseErr != nil || month < 1 || month > 12 || year < 2000 {
			utils.ErrorResponse(c, 400, "Formato de mês inválido. Use YYYY-MM (ex: 2024-03)")
			return
		}
	}
	
	summary, err := ctrl.expenseService.GetFamilyExpensesSummary(familyID, month, year)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao calcular resumo")
		return
	}
	
	utils.SuccessResponse(c, 200, summary)
}

// UpdateExpense atualiza uma despesa
func (ctrl *ExpenseController) UpdateExpense(c *gin.Context) {
	expenseID, _ := strconv.ParseUint(c.Param("expenseId"), 10, 32)
	
	expense, err := ctrl.expenseService.GetExpenseByID(uint(expenseID))
	if err != nil {
		utils.NotFoundResponse(c, "Despesa")
		return
	}
	
	var input struct {
		CategoryID  uint                         `json:"category_id"`
		Name        string                       `json:"name"`
		Description string                       `json:"description"`
		AmountCents int64                        `json:"amount_cents"`
		Frequency   string                       `json:"frequency"`
		ExpenseType string                       `json:"expense_type"`
		DueDay      int                          `json:"due_day"`
		IsFixed     *bool                        `json:"is_fixed"`
		Splits      []services.ExpenseSplitInput `json:"splits"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	if input.CategoryID > 0 {
		expense.CategoryID = input.CategoryID
	}
	if input.Name != "" {
		expense.Name = input.Name
	}
	expense.Description = input.Description
	if input.AmountCents > 0 {
		expense.AmountCents = input.AmountCents
	}
	if input.Frequency != "" {
		expense.Frequency = models.ExpenseFrequency(input.Frequency)
	}
	if input.ExpenseType != "" {
		expense.ExpenseType = models.ExpenseType(input.ExpenseType)
	}
	if input.DueDay > 0 {
		expense.DueDay = input.DueDay
	}
	if input.IsFixed != nil {
		expense.IsFixed = *input.IsFixed
	}
	
	err = ctrl.expenseService.UpdateExpense(expense, input.Splits)
	if err != nil {
		// Se for erro de validação, retornar detalhes
		if validationErr, ok := err.(utils.ValidationErrors); ok {
			utils.ValidationErrorResponse(c, validationErr)
			return
		}
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Despesa atualizada com sucesso", expense)
}

// DeleteExpense exclui uma despesa
func (ctrl *ExpenseController) DeleteExpense(c *gin.Context) {
	expenseID, _ := strconv.ParseUint(c.Param("expenseId"), 10, 32)
	
	err := ctrl.expenseService.DeleteExpense(uint(expenseID))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Despesa excluída com sucesso", nil)
}

// GetCategories busca todas as categorias
func (ctrl *ExpenseController) GetCategories(c *gin.Context) {
	categories, err := ctrl.expenseService.GetAllCategories()
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar categorias")
		return
	}
	
	utils.SuccessResponse(c, 200, categories)
}
