package controllers

import (
	"finance-backend/models"
	"finance-backend/services"
	"finance-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FamilyController struct {
	familyService *services.FamilyService
}

func NewFamilyController(familyService *services.FamilyService) *FamilyController {
	return &FamilyController{familyService: familyService}
}

// CreateFamily cria uma nova conta familiar
func (ctrl *FamilyController) CreateFamily(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	family := &models.FamilyAccount{
		Name:        input.Name,
		OwnerUserID: userID,
	}
	
	err := ctrl.familyService.CreateFamily(family)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 201, "Família criada com sucesso", family)
}

// GetFamily busca uma família por ID
func (ctrl *FamilyController) GetFamily(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	family, err := ctrl.familyService.GetFamilyByID(familyID)
	if err != nil {
		utils.NotFoundResponse(c, "Família")
		return
	}
	
	utils.SuccessResponse(c, 200, family)
}

// GetMyFamilies busca todas as famílias do usuário
func (ctrl *FamilyController) GetMyFamilies(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	families, err := ctrl.familyService.GetFamiliesByOwner(userID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar famílias")
		return
	}
	
	utils.SuccessResponse(c, 200, families)
}

// UpdateFamily atualiza uma família
func (ctrl *FamilyController) UpdateFamily(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	var input struct {
		Name string `json:"name" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	family, err := ctrl.familyService.GetFamilyByID(familyID)
	if err != nil {
		utils.NotFoundResponse(c, "Família")
		return
	}
	
	family.Name = input.Name
	
	err = ctrl.familyService.UpdateFamily(family)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Família atualizada com sucesso", family)
}

// DeleteFamily exclui uma família
func (ctrl *FamilyController) DeleteFamily(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	err := ctrl.familyService.DeleteFamily(familyID)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Família excluída com sucesso", nil)
}

// GetMembers busca membros de uma família
func (ctrl *FamilyController) GetMembers(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	members, err := ctrl.familyService.GetMembers(familyID)
	if err != nil {
		utils.InternalErrorResponse(c, "Erro ao buscar membros")
		return
	}
	
	utils.SuccessResponse(c, 200, members)
}

// AddMember adiciona um membro à família
func (ctrl *FamilyController) AddMember(c *gin.Context) {
	familyID := c.GetUint("family_id")
	
	var input struct {
		Name   string `json:"name" binding:"required"`
		UserID *uint  `json:"user_id"`
		Role   string `json:"role"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	member := &models.FamilyMember{
		FamilyAccountID: familyID,
		Name:            input.Name,
		UserID:          input.UserID,
		Role:            models.MemberRole(input.Role),
		IsActive:        true,
	}
	
	err := ctrl.familyService.AddMember(member)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 201, "Membro adicionado com sucesso", member)
}

// UpdateMember atualiza um membro
func (ctrl *FamilyController) UpdateMember(c *gin.Context) {
	memberIDParam := c.Param("memberId")
	memberID, err := strconv.ParseUint(memberIDParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, 400, "ID do membro inválido")
		return
	}
	
	var input struct {
		Name string `json:"name" binding:"required"`
		Role string `json:"role"`
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, 400, "Dados inválidos")
		return
	}
	
	member, err := ctrl.familyService.GetMemberByID(uint(memberID))
	if err != nil {
		utils.NotFoundResponse(c, "Membro")
		return
	}
	
	member.Name = input.Name
	if input.Role != "" {
		member.Role = models.MemberRole(input.Role)
	}
	
	err = ctrl.familyService.UpdateMember(member)
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Membro atualizado com sucesso", member)
}

// RemoveMember remove um membro
func (ctrl *FamilyController) RemoveMember(c *gin.Context) {
	memberIDParam := c.Param("memberId")
	memberID, err := strconv.ParseUint(memberIDParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, 400, "ID do membro inválido")
		return
	}
	
	err = ctrl.familyService.RemoveMember(uint(memberID))
	if err != nil {
		utils.ErrorResponse(c, 400, err.Error())
		return
	}
	
	utils.SuccessWithMessage(c, 200, "Membro removido com sucesso", nil)
}
