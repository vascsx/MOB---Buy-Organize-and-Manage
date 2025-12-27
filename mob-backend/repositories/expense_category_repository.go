package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
)

type ExpenseCategoryRepository struct {
	db *gorm.DB
}

func NewExpenseCategoryRepository(db *gorm.DB) *ExpenseCategoryRepository {
	return &ExpenseCategoryRepository{db: db}
}

// GetAll busca todas as categorias
func (r *ExpenseCategoryRepository) GetAll() ([]models.ExpenseCategory, error) {
	var categories []models.ExpenseCategory
	err := r.db.Order("name").Find(&categories).Error
	return categories, err
}

// GetByID busca categoria por ID
func (r *ExpenseCategoryRepository) GetByID(id uint) (*models.ExpenseCategory, error) {
	var category models.ExpenseCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetDefaults busca categorias padrão
func (r *ExpenseCategoryRepository) GetDefaults() ([]models.ExpenseCategory, error) {
	var categories []models.ExpenseCategory
	err := r.db.Where("is_default = ?", true).Order("name").Find(&categories).Error
	return categories, err
}

// Create cria uma nova categoria
func (r *ExpenseCategoryRepository) Create(category *models.ExpenseCategory) error {
	return r.db.Create(category).Error
}

// Update atualiza uma categoria
func (r *ExpenseCategoryRepository) Update(category *models.ExpenseCategory) error {
	return r.db.Save(category).Error
}

// Delete exclui uma categoria (se não tiver despesas associadas)
func (r *ExpenseCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&models.ExpenseCategory{}, id).Error
}
