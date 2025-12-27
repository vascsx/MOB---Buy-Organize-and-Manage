package services

import (
	"finance-backend/models"
	"finance-backend/repositories"
	"finance-backend/utils"
)

type FamilyService struct {
	familyRepo *repositories.FamilyRepository
}

func NewFamilyService(familyRepo *repositories.FamilyRepository) *FamilyService {
	return &FamilyService{familyRepo: familyRepo}
}

// CreateFamily cria uma nova conta familiar
func (s *FamilyService) CreateFamily(family *models.FamilyAccount) error {
	validator := utils.NewValidator()
	validator.Add(utils.ValidateRequiredString(family.Name, "name"))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	return s.familyRepo.Create(family)
}

// GetFamilyByID busca família por ID
func (s *FamilyService) GetFamilyByID(id uint) (*models.FamilyAccount, error) {
	return s.familyRepo.GetByID(id)
}

// GetFamiliesByOwner busca famílias por dono
func (s *FamilyService) GetFamiliesByOwner(ownerUserID uint) ([]models.FamilyAccount, error) {
	return s.familyRepo.GetByOwnerID(ownerUserID)
}

// UpdateFamily atualiza uma família
func (s *FamilyService) UpdateFamily(family *models.FamilyAccount) error {
	validator := utils.NewValidator()
	validator.Add(utils.ValidateRequiredString(family.Name, "name"))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	return s.familyRepo.Update(family)
}

// DeleteFamily exclui uma família
func (s *FamilyService) DeleteFamily(id uint) error {
	return s.familyRepo.Delete(id)
}

// GetMembers busca membros de uma família
func (s *FamilyService) GetMembers(familyID uint) ([]models.FamilyMember, error) {
	return s.familyRepo.GetMembers(familyID)
}

// AddMember adiciona um membro à família
func (s *FamilyService) AddMember(member *models.FamilyMember) error {
	validator := utils.NewValidator()
	validator.Add(utils.ValidateRequiredString(member.Name, "name"))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	return s.familyRepo.AddMember(member)
}

// UpdateMember atualiza um membro
func (s *FamilyService) UpdateMember(member *models.FamilyMember) error {
	validator := utils.NewValidator()
	validator.Add(utils.ValidateRequiredString(member.Name, "name"))
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	return s.familyRepo.UpdateMember(member)
}

// RemoveMember remove um membro
func (s *FamilyService) RemoveMember(memberID uint) error {
	return s.familyRepo.RemoveMember(memberID)
}

// GetMemberByID busca membro por ID
func (s *FamilyService) GetMemberByID(memberID uint) (*models.FamilyMember, error) {
	return s.familyRepo.GetMemberByID(memberID)
}
