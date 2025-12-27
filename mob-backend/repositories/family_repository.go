package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
)

type FamilyRepository struct {
	db *gorm.DB
}

func NewFamilyRepository(db *gorm.DB) *FamilyRepository {
	return &FamilyRepository{db: db}
}

// Create cria uma nova família
func (r *FamilyRepository) Create(family *models.FamilyAccount) error {
	return r.db.Create(family).Error
}

// GetByID busca família por ID
func (r *FamilyRepository) GetByID(id uint) (*models.FamilyAccount, error) {
	var family models.FamilyAccount
	err := r.db.Preload("Members").
		Preload("Expenses").
		Preload("Investments").
		Preload("EmergencyFund").
		First(&family, id).Error
	
	if err != nil {
		return nil, err
	}
	return &family, nil
}

// GetByOwnerID busca famílias por dono
func (r *FamilyRepository) GetByOwnerID(ownerUserID uint) ([]models.FamilyAccount, error) {
	var families []models.FamilyAccount
	err := r.db.Where("owner_user_id = ?", ownerUserID).
		Preload("Members").
		Find(&families).Error
	
	return families, err
}

// Update atualiza uma família
func (r *FamilyRepository) Update(family *models.FamilyAccount) error {
	return r.db.Save(family).Error
}

// Delete exclui uma família
func (r *FamilyRepository) Delete(id uint) error {
	return r.db.Delete(&models.FamilyAccount{}, id).Error
}

// UserHasAccess verifica se um usuário tem acesso a uma família
func (r *FamilyRepository) UserHasAccess(userID, familyID uint) (bool, error) {
	var count int64
	
	// Verificar se é owner
	err := r.db.Model(&models.FamilyAccount{}).
		Where("id = ? AND owner_user_id = ?", familyID, userID).
		Count(&count).Error
	
	if err != nil {
		return false, err
	}
	
	if count > 0 {
		return true, nil
	}
	
	// Verificar se é membro
	err = r.db.Model(&models.FamilyMember{}).
		Where("family_account_id = ? AND user_id = ? AND is_active = ?", familyID, userID, true).
		Count(&count).Error
	
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}

// GetMembers busca membros de uma família
func (r *FamilyRepository) GetMembers(familyID uint) ([]models.FamilyMember, error) {
	var members []models.FamilyMember
	err := r.db.Where("family_account_id = ?", familyID).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "email")
		}).
		Preload("Incomes", func(db *gorm.DB) *gorm.DB {
			return db.Where("is_active = ?", true).Select("id", "family_member_id", "type", "gross_monthly_cents", "net_monthly_cents")
		}).
		Find(&members).Error
	
	return members, err
}

// AddMember adiciona um membro à família
func (r *FamilyRepository) AddMember(member *models.FamilyMember) error {
	return r.db.Create(member).Error
}

// UpdateMember atualiza um membro
func (r *FamilyRepository) UpdateMember(member *models.FamilyMember) error {
	return r.db.Save(member).Error
}

// RemoveMember remove um membro (soft delete via is_active)
func (r *FamilyRepository) RemoveMember(memberID uint) error {
	return r.db.Model(&models.FamilyMember{}).
		Where("id = ?", memberID).
		Update("is_active", false).Error
}

// GetMemberByID busca membro por ID
func (r *FamilyRepository) GetMemberByID(memberID uint) (*models.FamilyMember, error) {
	var member models.FamilyMember
	err := r.db.Preload("Incomes").First(&member, memberID).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// MemberBelongsToFamily verifica se um membro pertence a uma família
func (r *FamilyRepository) MemberBelongsToFamily(memberID, familyID uint) (bool, error) {
	var count int64
	
	err := r.db.Model(&models.FamilyMember{}).
		Where("id = ? AND family_account_id = ? AND is_active = ?", memberID, familyID, true).
		Count(&count).Error
	
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}
