package controllers

import (
	"finance-backend/models"
	"finance-backend/services"
	"finance-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type IncomeController struct {
	incomeService *services.IncomeService
}

func NewIncomeController(incomeService *services.IncomeService) *IncomeController {
	return &IncomeController{incomeService: incomeService}
}

// CreateIncome cria uma nova renda
func (ctrl *IncomeController) CreateIncome(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	var input struct {
		FamilyMemberID        uint    `json:"family_member_id" binding:"required"`
		Type                  string  `json:"type" binding:"required"`
		GrossMonthlyCents     int64   `json:"gross_monthly_cents" binding:"required"`
		FoodVoucherCents      int64   `json:"food_voucher_cents"`
		TransportVoucherCents int64   `json:"transport_voucher_cents"`
		BonusCents            int64   `json:"bonus_cents"`
		SimplesNacionalRate   float64 `json:"simples_nacional_rate"`
		ProLaboreCents        int64   `json:"pro_labore_cents"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	// Validar que o membro pertence à família
	if err := ctrl.incomeService.ValidateMemberBelongsToFamily(input.FamilyMemberID, familyID); err != nil {
		utils.ErrorResponse(c, 403, "Membro não pertence a esta família")
		return
	}
	
	income := &models.Income{
		FamilyMemberID:        input.FamilyMemberID,
		Type:                  models.IncomeType(input.Type),
		GrossMonthlyCents:     input.GrossMonthlyCents,
		FoodVoucherCents:      input.FoodVoucherCents,
		TransportVoucherCents: input.TransportVoucherCents,
		BonusCents:            input.BonusCents,
		SimplesNacionalRate:   input.SimplesNacionalRate,
		ProLaboreCents:        input.ProLaboreCents,
		IsActive:              true,
	}
	
	err := ctrl.incomeService.CreateIncome(income)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 201, "Renda criada com sucesso", income)
}

// GetIncome busca renda por ID
func (ctrl *IncomeController) GetIncome(c *gin.Context) {
	incomeID, _ := strconv.ParseUint(c.Param("incomeId"), 10, 32)
	
	income, err := ctrl.incomeService.GetIncomeByID(uint(incomeID))
	if err != nil {
		utils.NotFoundResponse(c, "Renda")
		return
	}
	
	utils.SuccessResponse(c, 200, income)
}

// GetFamilyIncomes busca rendas de uma família
func (ctrl *IncomeController) GetFamilyIncomes(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	incomes, err := ctrl.incomeService.GetIncomesByFamilyID(familyID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar rendas")
		return
	}
	
	utils.SuccessResponse(c, 200, incomes)
}

// GetFamilyIncomeSummary retorna resumo das rendas da família
func (ctrl *IncomeController) GetFamilyIncomeSummary(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	summary, err := ctrl.incomeService.GetFamilyIncomeSummary(familyID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao calcular resumo")
		return
	}
	
	utils.SuccessResponse(c, 200, summary)
}

// GetIncomeBreakdown retorna detalhamento de uma renda
func (ctrl *IncomeController) GetIncomeBreakdown(c *gin.Context) {
	incomeID, _ := strconv.ParseUint(c.Param("incomeId"), 10, 32)
	
	breakdown, err := ctrl.incomeService.GetIncomeBreakdown(uint(incomeID))
	if err != nil {
		utils.NotFoundResponse(c, "Renda")
		return
	}
	
	utils.SuccessResponse(c, 200, breakdown)
}

// UpdateIncome atualiza uma renda
func (ctrl *IncomeController) UpdateIncome(c *gin.Context) {
	incomeID, _ := strconv.ParseUint(c.Param("incomeId"), 10, 32)
	
	income, err := ctrl.incomeService.GetIncomeByID(uint(incomeID))
	if err != nil {
		utils.NotFoundResponse(c, "Renda")
		return
	}
	
	var input struct {
		Type                  string  `json:"type"`
		GrossMonthlyCents     int64   `json:"gross_monthly_cents"`
		FoodVoucherCents      int64   `json:"food_voucher_cents"`
		TransportVoucherCents int64   `json:"transport_voucher_cents"`
		BonusCents            int64   `json:"bonus_cents"`
		SimplesNacionalRate   float64 `json:"simples_nacional_rate"`
		ProLaboreCents        int64   `json:"pro_labore_cents"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	if input.Type != "" {
		income.Type = models.IncomeType(input.Type)
	}
	if input.GrossMonthlyCents > 0 {
		income.GrossMonthlyCents = input.GrossMonthlyCents
	}
	income.FoodVoucherCents = input.FoodVoucherCents
	income.TransportVoucherCents = input.TransportVoucherCents
	income.BonusCents = input.BonusCents
	income.SimplesNacionalRate = input.SimplesNacionalRate
	income.ProLaboreCents = input.ProLaboreCents
	
	err = ctrl.incomeService.UpdateIncome(income)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Renda atualizada com sucesso", income)
}

// DeleteIncome exclui uma renda
func (ctrl *IncomeController) DeleteIncome(c *gin.Context) {
	incomeID, _ := strconv.ParseUint(c.Param("incomeId"), 10, 32)
	
	err := ctrl.incomeService.DeleteIncome(uint(incomeID))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Renda excluída com sucesso", nil)
}
