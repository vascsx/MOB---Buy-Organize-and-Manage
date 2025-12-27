package controllers

import (
	"finance-backend/services"
	"finance-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EmergencyFundController struct {
	emergencyService *services.EmergencyFundService
}

func NewEmergencyFundController(emergencyService *services.EmergencyFundService) *EmergencyFundController {
	return &EmergencyFundController{emergencyService: emergencyService}
}

// CreateOrUpdateEmergencyFund cria ou atualiza reserva de emergência
func (ctrl *EmergencyFundController) CreateOrUpdateEmergencyFund(c *gin.Context) {
	familyID := c.GetUint("family_id")

	var input struct {
		TargetMonths     int     `json:"target_months" binding:"required"`
		MonthlyExpenses  float64 `json:"monthly_expenses" binding:"required"`
		MonthlyGoal      float64 `json:"monthly_goal" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}

	fund, err := ctrl.emergencyService.CreateOrUpdateEmergencyFund(
		familyID,
		input.TargetMonths,
		input.MonthlyExpenses,
		input.MonthlyGoal,
	)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}

	utils.SuccessWithMessage(c, 200, "Reserva de emergência configurada com sucesso", fund)
}

// GetEmergencyFund busca reserva de emergência
func (ctrl *EmergencyFundController) GetEmergencyFund(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	fund, err := ctrl.emergencyService.GetEmergencyFund(familyID)
	if err != nil {
		utils.NotFoundResponse(c, "Reserva de emergência")
		return
	}
	
	utils.SuccessResponse(c, 200, fund)
}

// GetEmergencyFundProgress retorna progresso da reserva
func (ctrl *EmergencyFundController) GetEmergencyFundProgress(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	progress, err := ctrl.emergencyService.GetEmergencyFundProgress(familyID)
	if err != nil {
		utils.NotFoundResponse(c, "Reserva de emergência")
		return
	}
	
	utils.SuccessResponse(c, 200, progress)
}

// UpdateCurrentAmount atualiza valor atual da reserva
func (ctrl *EmergencyFundController) UpdateCurrentAmount(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	var input struct {
		CurrentAmountCents int64 `json:"current_amount_cents" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	err := ctrl.emergencyService.UpdateCurrentAmount(familyID, input.CurrentAmountCents)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Valor atualizado com sucesso", nil)
}

// SuggestMonthlyGoal sugere aporte mensal
func (ctrl *EmergencyFundController) SuggestMonthlyGoal(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	targetMonths := 6 // padrão
	desiredMonths := 12 // padrão
	
	if tm := c.Query("target_months"); tm != "" {
		if t, err := strconv.Atoi(tm); err == nil {
			targetMonths = t
		}
	}
	
	if dm := c.Query("desired_months"); dm != "" {
		if d, err := strconv.Atoi(dm); err == nil {
			desiredMonths = d
		}
	}
	
	suggestion, err := ctrl.emergencyService.SuggestMonthlyGoal(familyID, targetMonths, desiredMonths)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao calcular sugestão")
		return
	}
	
	utils.SuccessResponse(c, 200, suggestion)
}

// GetEmergencyFundProjection retorna projeção da reserva
func (ctrl *EmergencyFundController) GetEmergencyFundProjection(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	months := 24 // padrão
	if m := c.Query("months"); m != "" {
		if mo, err := strconv.Atoi(m); err == nil && mo > 0 {
			months = mo
		}
	}
	
	projection, err := ctrl.emergencyService.GetEmergencyFundProjection(familyID, months)
	if err != nil {
		utils.NotFoundResponse(c, "Reserva de emergência")
		return
	}
	
	utils.SuccessResponse(c, 200, projection)
}

// DeleteEmergencyFund exclui reserva de emergência
func (ctrl *EmergencyFundController) DeleteEmergencyFund(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	err := ctrl.emergencyService.DeleteEmergencyFund(familyID)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Reserva de emergência excluída com sucesso", nil)
}
