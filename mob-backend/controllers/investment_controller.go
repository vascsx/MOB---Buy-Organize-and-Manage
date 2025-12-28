package controllers

import (
	"finance-backend/models"
	"finance-backend/services"
	"finance-backend/utils"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type InvestmentController struct {
	investmentService *services.InvestmentService
}

func NewInvestmentController(investmentService *services.InvestmentService) *InvestmentController {
	return &InvestmentController{investmentService: investmentService}
}

// CreateInvestment cria um novo investimento
func (ctrl *InvestmentController) CreateInvestment(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	var input struct {
		Name                     string  `json:"name" binding:"required"`
		Type                     string  `json:"type" binding:"required"`
		MonthlyContributionCents int64   `json:"monthly_contribution_cents" binding:"required"`
		CurrentBalanceCents      int64   `json:"current_balance_cents"`
		AnnualReturnRate         float64 `json:"annual_return_rate" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	investment := &models.Investment{
		FamilyAccountID:          familyID,
		Name:                     input.Name,
		Type:                     models.InvestmentType(input.Type),
		MonthlyContributionCents: input.MonthlyContributionCents,
		CurrentBalanceCents:      input.CurrentBalanceCents,
		AnnualReturnRate:         input.AnnualReturnRate,
		StartDate:                time.Now(),
		IsActive:                 true,
	}
	
	err := ctrl.investmentService.CreateInvestment(investment)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 201, "Investimento criado com sucesso", investment)
}

// GetInvestment busca investimento por ID
func (ctrl *InvestmentController) GetInvestment(c *gin.Context) {
	investmentID, _ := strconv.ParseUint(c.Param("investmentId"), 10, 32)
	
	investment, err := ctrl.investmentService.GetInvestmentByID(uint(investmentID))
	if err != nil {
		utils.NotFoundResponse(c, "Investimento")
		return
	}
	
	utils.SuccessResponse(c, 200, investment)
}

// GetFamilyInvestments busca investimentos de uma família
func (ctrl *InvestmentController) GetFamilyInvestments(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	investments, err := ctrl.investmentService.GetInvestmentsByFamilyID(familyID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar investimentos")
		return
	}
	
	utils.SuccessResponse(c, 200, investments)
}

// GetInvestmentsSummary retorna resumo dos investimentos
func (ctrl *InvestmentController) GetInvestmentsSummary(c *gin.Context) {
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
	
	summary, err := ctrl.investmentService.GetInvestmentsSummary(familyID, month, year)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao calcular resumo")
		return
	}
	
	utils.SuccessResponse(c, 200, summary)
}

// GetInvestmentProjection retorna projeção de um investimento
func (ctrl *InvestmentController) GetInvestmentProjection(c *gin.Context) {
	investmentID, _ := strconv.ParseUint(c.Param("investmentId"), 10, 32)
	
	years := 5 // padrão
	if yearsParam := c.Query("years"); yearsParam != "" {
		if y, err := strconv.Atoi(yearsParam); err == nil && y > 0 && y <= 10 {
			years = y
		}
	}
	
	projection, err := ctrl.investmentService.GetInvestmentProjection(uint(investmentID), years)
	if err != nil {
		utils.NotFoundResponse(c, "Investimento")
		return
	}
	
	utils.SuccessResponse(c, 200, projection)
}

// GetFamilyInvestmentsProjection retorna projeção consolidada
func (ctrl *InvestmentController) GetFamilyInvestmentsProjection(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	years := 5 // padrão
	if yearsParam := c.Query("years"); yearsParam != "" {
		if y, err := strconv.Atoi(yearsParam); err == nil && y > 0 && y <= 10 {
			years = y
		}
	}
	
	projection, err := ctrl.investmentService.GetFamilyInvestmentsProjection(familyID, years)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao calcular projeção")
		return
	}
	
	utils.SuccessResponse(c, 200, projection)
}

// UpdateInvestment atualiza um investimento
func (ctrl *InvestmentController) UpdateInvestment(c *gin.Context) {
	investmentID, _ := strconv.ParseUint(c.Param("investmentId"), 10, 32)
	
	investment, err := ctrl.investmentService.GetInvestmentByID(uint(investmentID))
	if err != nil {
		utils.NotFoundResponse(c, "Investimento")
		return
	}
	
	var input struct {
		Name                     string  `json:"name"`
		Type                     string  `json:"type"`
		MonthlyContributionCents int64   `json:"monthly_contribution_cents"`
		CurrentBalanceCents      int64   `json:"current_balance_cents"`
		AnnualReturnRate         float64 `json:"annual_return_rate"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	if input.Name != "" {
		investment.Name = input.Name
	}
	if input.Type != "" {
		investment.Type = models.InvestmentType(input.Type)
	}
	if input.MonthlyContributionCents > 0 {
		investment.MonthlyContributionCents = input.MonthlyContributionCents
	}
	if input.CurrentBalanceCents >= 0 {
		investment.CurrentBalanceCents = input.CurrentBalanceCents
	}
	if input.AnnualReturnRate != 0 {
		investment.AnnualReturnRate = input.AnnualReturnRate
	}
	
	err = ctrl.investmentService.UpdateInvestment(investment)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Investimento atualizado com sucesso", investment)
}

// DeleteInvestment exclui um investimento
func (ctrl *InvestmentController) DeleteInvestment(c *gin.Context) {
	investmentID, _ := strconv.ParseUint(c.Param("investmentId"), 10, 32)
	
	err := ctrl.investmentService.DeleteInvestment(uint(investmentID))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Investimento excluído com sucesso", nil)
}
