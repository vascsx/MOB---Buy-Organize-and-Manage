package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
	"time"
)

type TaxRepository struct {
	db *gorm.DB
}

func NewTaxRepository(db *gorm.DB) *TaxRepository {
	return &TaxRepository{db: db}
}

// GetINSSBrackets retorna faixas de INSS para um ano específico
func (r *TaxRepository) GetINSSBrackets(year int) ([]models.INSSBracket, error) {
	var brackets []models.INSSBracket
	err := r.db.Where("year = ? AND is_active = ?", year, true).
		Order("\"order\" ASC").
		Find(&brackets).Error
	
	return brackets, err
}

// GetIRPFBrackets retorna faixas de IRPF para um ano específico
func (r *TaxRepository) GetIRPFBrackets(year int) ([]models.IRPFBracket, error) {
	var brackets []models.IRPFBracket
	err := r.db.Where("year = ? AND is_active = ?", year, true).
		Order("\"order\" ASC").
		Find(&brackets).Error
	
	return brackets, err
}

// GetTaxConfiguration retorna configuração de impostos para um ano
func (r *TaxRepository) GetTaxConfiguration(year int) (*models.TaxConfiguration, error) {
	var config models.TaxConfiguration
	err := r.db.Where("year = ? AND is_active = ?", year, true).
		First(&config).Error
	
	if err != nil {
		return nil, err
	}
	return &config, nil
}

// GetCurrentYear retorna o ano atual
func (r *TaxRepository) GetCurrentYear() int {
	return time.Now().Year()
}

// CreateINSSBracket cria nova faixa de INSS
func (r *TaxRepository) CreateINSSBracket(bracket *models.INSSBracket) error {
	return r.db.Create(bracket).Error
}

// CreateIRPFBracket cria nova faixa de IRPF
func (r *TaxRepository) CreateIRPFBracket(bracket *models.IRPFBracket) error {
	return r.db.Create(bracket).Error
}

// CreateTaxConfiguration cria nova configuração de impostos
func (r *TaxRepository) CreateTaxConfiguration(config *models.TaxConfiguration) error {
	return r.db.Create(config).Error
}

// UpdateINSSBracket atualiza faixa de INSS
func (r *TaxRepository) UpdateINSSBracket(bracket *models.INSSBracket) error {
	return r.db.Save(bracket).Error
}

// UpdateIRPFBracket atualiza faixa de IRPF
func (r *TaxRepository) UpdateIRPFBracket(bracket *models.IRPFBracket) error {
	return r.db.Save(bracket).Error
}

// UpdateTaxConfiguration atualiza configuração de impostos
func (r *TaxRepository) UpdateTaxConfiguration(config *models.TaxConfiguration) error {
	return r.db.Save(config).Error
}

// DeactivateINSSBracketsForYear desativa todas as faixas de INSS de um ano
func (r *TaxRepository) DeactivateINSSBracketsForYear(year int) error {
	return r.db.Model(&models.INSSBracket{}).
		Where("year = ?", year).
		Update("is_active", false).Error
}

// DeactivateIRPFBracketsForYear desativa todas as faixas de IRPF de um ano
func (r *TaxRepository) DeactivateIRPFBracketsForYear(year int) error {
	return r.db.Model(&models.IRPFBracket{}).
		Where("year = ?", year).
		Update("is_active", false).Error
}

// ActivateYearConfiguration ativa configuração e faixas de um ano específico
func (r *TaxRepository) ActivateYearConfiguration(year int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Ativar configuração
		err := tx.Model(&models.TaxConfiguration{}).
			Where("year = ?", year).
			Update("is_active", true).Error
		if err != nil {
			return err
		}
		
		// Ativar faixas INSS
		err = tx.Model(&models.INSSBracket{}).
			Where("year = ?", year).
			Update("is_active", true).Error
		if err != nil {
			return err
		}
		
		// Ativar faixas IRPF
		err = tx.Model(&models.IRPFBracket{}).
			Where("year = ?", year).
			Update("is_active", true).Error
		
		return err
	})
}

// GetAvailableYears retorna lista de anos com configuração cadastrada
func (r *TaxRepository) GetAvailableYears() ([]int, error) {
	var years []int
	err := r.db.Model(&models.TaxConfiguration{}).
		Distinct("year").
		Order("year DESC").
		Pluck("year", &years).Error
	
	return years, err
}
