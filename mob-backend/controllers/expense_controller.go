package controllers

import (
	"finance-backend/models"
	"finance-backend/services"
	"finance-backend/utils"
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
		CategoryID  uint                         `json:"category_id" binding:"required"`
		Name        string                       `json:"name" binding:"required"`
		Description string                       `json:"description"`
		AmountCents int64                        `json:"amount_cents" binding:"required"`
		Frequency   string                       `json:"frequency"`
		DueDay      int                          `json:"due_day"`
		IsFixed     bool                         `json:"is_fixed"`
		Splits      []services.ExpenseSplitInput `json:"splits" binding:"required"`
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
		DueDay:          input.DueDay,
		IsFixed:         input.IsFixed,
		IsActive:        true,
	}
	
	err := ctrl.expenseService.CreateExpense(expense, input.Splits)
	if err != nil {
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
	
	expenses, err := ctrl.expenseService.GetExpensesByFamilyID(familyID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar despesas")
		return
	}
	
	utils.SuccessResponse(c, 200, expenses)
}

// GetExpensesByCategory retorna despesas agrupadas por categoria
func (ctrl *ExpenseController) GetExpensesByCategory(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	result, err := ctrl.expenseService.GetExpensesByCategory(familyID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao agrupar despesas")
		return
	}
	
	utils.SuccessResponse(c, 200, result)
}

// GetExpensesSummary retorna resumo das despesas
func (ctrl *ExpenseController) GetExpensesSummary(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	summary, err := ctrl.expenseService.GetFamilyExpensesSummary(familyID)
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
	if input.DueDay > 0 {
		expense.DueDay = input.DueDay
	}
	if input.IsFixed != nil {
		expense.IsFixed = *input.IsFixed
	}
	
	err = ctrl.expenseService.UpdateExpense(expense, input.Splits)
	if err != nil {
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
