package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
)

type IncomeRepository struct {
	db *gorm.DB
}

func NewIncomeRepository(db *gorm.DB) *IncomeRepository {
	return &IncomeRepository{db: db}
}

// Create cria uma nova renda
func (r *IncomeRepository) Create(income *models.Income) error {
	return r.db.Create(income).Error
}

// GetByID busca renda por ID
func (r *IncomeRepository) GetByID(id uint) (*models.Income, error) {
	var income models.Income
	err := r.db.Preload("FamilyMember").First(&income, id).Error
	if err != nil {
		return nil, err
	}
	return &income, nil
}

// GetByMemberID busca rendas de um membro
func (r *IncomeRepository) GetByMemberID(memberID uint) ([]models.Income, error) {
	var incomes []models.Income
	err := r.db.Where("family_member_id = ?", memberID).Find(&incomes).Error
	return incomes, err
}

// GetActiveByMemberID busca renda ativa de um membro
func (r *IncomeRepository) GetActiveByMemberID(memberID uint) (*models.Income, error) {
	var income models.Income
	err := r.db.Where("family_member_id = ? AND is_active = ?", memberID, true).
		First(&income).Error
	
	if err != nil {
		return nil, err
	}
	return &income, nil
}

// GetByFamilyID busca todas as rendas de uma família
func (r *IncomeRepository) GetByFamilyID(familyID uint) ([]models.Income, error) {
	var incomes []models.Income
	err := r.db.Joins("JOIN family_members ON family_members.id = incomes.family_member_id").
		Where("family_members.family_account_id = ? AND incomes.is_active = ?", familyID, true).
		Preload("FamilyMember", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "family_account_id", "role")
		}).
		Select("incomes.*").
		Find(&incomes).Error
	
	return incomes, err
}

// GetByFamilyIDAndMonth busca rendas de uma família filtradas por mês/ano
func (r *IncomeRepository) GetByFamilyIDAndMonth(familyID uint, month, year int) ([]models.Income, error) {
	var incomes []models.Income
	err := r.db.Joins("JOIN family_members ON family_members.id = incomes.family_member_id").
		Where("family_members.family_account_id = ? AND incomes.is_active = ? AND incomes.reference_month = ? AND incomes.reference_year = ?", 
			familyID, true, month, year).
		Preload("FamilyMember", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "family_account_id", "role")
		}).
		Select("incomes.*").
		Find(&incomes).Error
	
	return incomes, err
}

// Update atualiza uma renda
func (r *IncomeRepository) Update(income *models.Income) error {
	return r.db.Save(income).Error
}

// Delete exclui uma renda (soft delete via is_active)
func (r *IncomeRepository) Delete(id uint) error {
	return r.db.Model(&models.Income{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

// DeactivateOtherIncomes desativa outras rendas do mesmo membro (apenas uma ativa por vez)
func (r *IncomeRepository) DeactivateOtherIncomes(memberID, exceptIncomeID uint) error {
	return r.db.Model(&models.Income{}).
		Where("family_member_id = ? AND id != ?", memberID, exceptIncomeID).
		Update("is_active", false).Error
}

// CalculateTotalFamilyIncome calcula a renda líquida total da família
func (r *IncomeRepository) CalculateTotalFamilyIncome(familyID uint) (int64, error) {
	var total int64
	
	err := r.db.Model(&models.Income{}).
		Select("COALESCE(SUM(net_monthly_cents), 0)").
		Joins("JOIN family_members ON family_members.id = incomes.family_member_id").
		Where("family_members.family_account_id = ? AND incomes.is_active = ?", familyID, true).
		Scan(&total).Error
	
	return total, err
}

// CreateWithTransaction cria uma renda dentro de uma transação
func (r *IncomeRepository) CreateWithTransaction(fn func(*IncomeRepository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &IncomeRepository{db: tx}
		return fn(txRepo)
	})
}

// UpdateWithTransaction atualiza uma renda dentro de uma transação
func (r *IncomeRepository) UpdateWithTransaction(fn func(*IncomeRepository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &IncomeRepository{db: tx}
		return fn(txRepo)
	})
}
