package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
)

type InvestmentRepository struct {
	db *gorm.DB
}

func NewInvestmentRepository(db *gorm.DB) *InvestmentRepository {
	return &InvestmentRepository{db: db}
}

// Create cria um novo investimento
func (r *InvestmentRepository) Create(investment *models.Investment) error {
	return r.db.Create(investment).Error
}

// GetByID busca investimento por ID
func (r *InvestmentRepository) GetByID(id uint) (*models.Investment, error) {
	var investment models.Investment
	err := r.db.First(&investment, id).Error
	if err != nil {
		return nil, err
	}
	return &investment, nil
}

// GetByFamilyID busca investimentos de uma família
func (r *InvestmentRepository) GetByFamilyID(familyID uint) ([]models.Investment, error) {
	var investments []models.Investment
	err := r.db.Where("family_account_id = ? AND is_active = ?", familyID, true).
		Order("name").
		Find(&investments).Error
	
	return investments, err
}

// GetByFamilyIDAndMonth busca investimentos de uma família filtrados por mês/ano
func (r *InvestmentRepository) GetByFamilyIDAndMonth(familyID uint, month, year int) ([]models.Investment, error) {
	var investments []models.Investment
	err := r.db.Where("family_account_id = ? AND is_active = ? AND reference_month = ? AND reference_year = ?", 
		familyID, true, month, year).
		Order("name").
		Find(&investments).Error
	
	return investments, err
}

// GetByFamilyIDAndType busca investimentos de uma família por tipo
func (r *InvestmentRepository) GetByFamilyIDAndType(familyID uint, investmentType models.InvestmentType) ([]models.Investment, error) {
	var investments []models.Investment
	err := r.db.Where("family_account_id = ? AND type = ? AND is_active = ?", 
		familyID, investmentType, true).
		Order("name").
		Find(&investments).Error
	
	return investments, err
}

// Update atualiza um investimento
func (r *InvestmentRepository) Update(investment *models.Investment) error {
	return r.db.Save(investment).Error
}

// Delete exclui um investimento (soft delete)
func (r *InvestmentRepository) Delete(id uint) error {
	return r.db.Model(&models.Investment{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

// UpdateBalance atualiza o saldo de um investimento
func (r *InvestmentRepository) UpdateBalance(id uint, newBalanceCents int64) error {
	return r.db.Model(&models.Investment{}).
		Where("id = ?", id).
		Update("current_balance_cents", newBalanceCents).Error
}

// CalculateTotalInvestments calcula o total investido mensalmente
func (r *InvestmentRepository) CalculateTotalInvestments(familyID uint) (int64, error) {
	var total int64
	
	err := r.db.Model(&models.Investment{}).
		Select("COALESCE(SUM(monthly_contribution_cents), 0)").
		Where("family_account_id = ? AND is_active = ?", familyID, true).
		Scan(&total).Error
	
	return total, err
}

// CalculateTotalBalance calcula o saldo total de todos os investimentos
func (r *InvestmentRepository) CalculateTotalBalance(familyID uint) (int64, error) {
	var total int64
	
	err := r.db.Model(&models.Investment{}).
		Select("COALESCE(SUM(current_balance_cents), 0)").
		Where("family_account_id = ? AND is_active = ?", familyID, true).
		Scan(&total).Error
	
	return total, err
}

// GetInvestmentsSummary retorna resumo dos investimentos por tipo
func (r *InvestmentRepository) GetInvestmentsSummary(familyID uint) ([]struct {
	Type                     models.InvestmentType
	Count                    int64
	TotalBalanceCents        int64
	TotalMonthlyCents        int64
	AverageReturnRate        float64
}, error) {
	var results []struct {
		Type              models.InvestmentType
		Count             int64
		TotalBalanceCents int64
		TotalMonthlyCents int64
		AverageReturnRate float64
	}
	
	err := r.db.Model(&models.Investment{}).
		Select("type, COUNT(*) as count, SUM(current_balance_cents) as total_balance_cents, SUM(monthly_contribution_cents) as total_monthly_cents, AVG(annual_return_rate) as average_return_rate").
		Where("family_account_id = ? AND is_active = ?", familyID, true).
		Group("type").
		Scan(&results).Error
	
	return results, err
}
