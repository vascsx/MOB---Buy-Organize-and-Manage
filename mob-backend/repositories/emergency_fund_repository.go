package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
)

type EmergencyFundRepository struct {
	db *gorm.DB
}

func NewEmergencyFundRepository(db *gorm.DB) *EmergencyFundRepository {
	return &EmergencyFundRepository{db: db}
}

// Create cria um novo fundo de emergência
func (r *EmergencyFundRepository) Create(fund *models.EmergencyFund) error {
	return r.db.Create(fund).Error
}

// GetByFamilyID busca fundo de emergência de uma família
func (r *EmergencyFundRepository) GetByFamilyID(familyID uint) (*models.EmergencyFund, error) {
	var fund models.EmergencyFund
	err := r.db.Where("family_account_id = ?", familyID).First(&fund).Error
	if err != nil {
		return nil, err
	}
	return &fund, nil
}

// Update atualiza um fundo de emergência
func (r *EmergencyFundRepository) Update(fund *models.EmergencyFund) error {
	return r.db.Save(fund).Error
}

// UpdateAmount atualiza apenas o valor atual
func (r *EmergencyFundRepository) UpdateAmount(familyID uint, newAmountCents int64) error {
	return r.db.Model(&models.EmergencyFund{}).
		Where("family_account_id = ?", familyID).
		Update("current_amount_cents", newAmountCents).Error
}

// Delete exclui um fundo de emergência
func (r *EmergencyFundRepository) Delete(familyID uint) error {
	return r.db.Where("family_account_id = ?", familyID).
		Delete(&models.EmergencyFund{}).Error
}

// Exists verifica se já existe um fundo de emergência para a família
func (r *EmergencyFundRepository) Exists(familyID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.EmergencyFund{}).
		Where("family_account_id = ?", familyID).
		Count(&count).Error
	
	return count > 0, err
}
