package repositories

import (
	"finance-backend/models"
	"gorm.io/gorm"
)

type ExpenseRepository struct {
	db *gorm.DB
}

func NewExpenseRepository(db *gorm.DB) *ExpenseRepository {
	return &ExpenseRepository{db: db}
}

// Create cria uma nova despesa
func (r *ExpenseRepository) Create(expense *models.Expense) error {
	return r.db.Create(expense).Error
}

// GetByID busca despesa por ID
func (r *ExpenseRepository) GetByID(id uint) (*models.Expense, error) {
	var expense models.Expense
	err := r.db.Preload("Category").
		Preload("Splits", func(db *gorm.DB) *gorm.DB {
			return db.Order("family_member_id")
		}).
		Preload("Splits.FamilyMember", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "family_account_id")
		}).
		First(&expense, id).Error
	
	if err != nil {
		return nil, err
	}
	return &expense, nil
}

// GetByFamilyID busca despesas de uma família
func (r *ExpenseRepository) GetByFamilyID(familyID uint) ([]models.Expense, error) {
	var expenses []models.Expense
	err := r.db.Where("family_account_id = ? AND is_active = ?", familyID, true).
		Preload("Category").
		Preload("Splits", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "expense_id", "family_member_id", "percentage", "amount_cents")
		}).
		Preload("Splits.FamilyMember", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "family_account_id")
		}).
		Order("name").
		Find(&expenses).Error
	
	return expenses, err
}

// GetByFamilyIDAndMonth busca despesas de uma família filtradas por mês/ano
func (r *ExpenseRepository) GetByFamilyIDAndMonth(familyID uint, month, year int) ([]models.Expense, error) {
	var expenses []models.Expense
	err := r.db.Where("family_account_id = ? AND is_active = ? AND reference_month = ? AND reference_year = ?", 
		familyID, true, month, year).
		Preload("Category").
		Preload("Splits", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "expense_id", "family_member_id", "percentage", "amount_cents")
		}).
		Preload("Splits.FamilyMember", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "family_account_id")
		}).
		Order("name").
		Find(&expenses).Error
	
	return expenses, err
}

// GetByFamilyIDWithCategory busca despesas de uma família filtradas por categoria
func (r *ExpenseRepository) GetByFamilyIDWithCategory(familyID, categoryID uint) ([]models.Expense, error) {
	var expenses []models.Expense
	err := r.db.Where("family_account_id = ? AND category_id = ? AND is_active = ?", 
		familyID, categoryID, true).
		Preload("Category").
		Preload("Splits").
		Order("name").
		Find(&expenses).Error
	
	return expenses, err
}

// Update atualiza uma despesa
func (r *ExpenseRepository) Update(expense *models.Expense) error {
	return r.db.Save(expense).Error
}

// Delete exclui uma despesa (soft delete)
func (r *ExpenseRepository) Delete(id uint) error {
	return r.db.Model(&models.Expense{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

// CreateSplit cria uma divisão de despesa
func (r *ExpenseRepository) CreateSplit(split *models.ExpenseSplit) error {
	return r.db.Create(split).Error
}

// DeleteSplitsByExpenseID exclui todas as divisões de uma despesa
func (r *ExpenseRepository) DeleteSplitsByExpenseID(expenseID uint) error {
	return r.db.Where("expense_id = ?", expenseID).Delete(&models.ExpenseSplit{}).Error
}

// CalculateTotalMonthlyExpenses calcula total de despesas mensais de uma família
// Inclui despesas mensais + anuais/12
func (r *ExpenseRepository) CalculateTotalMonthlyExpenses(familyID uint) (int64, error) {
	var expenses []models.Expense
	
	err := r.db.Where("family_account_id = ? AND is_active = ?", familyID, true).
		Find(&expenses).Error
	
	if err != nil {
		return 0, err
	}
	
	var totalMonthly int64
	for _, expense := range expenses {
		switch expense.Frequency {
		case models.ExpenseMonthly:
			totalMonthly += expense.AmountCents
		case models.ExpenseYearly:
			// Converter anual para mensal (dividir por 12)
			totalMonthly += expense.AmountCents / 12
		// one_time não entra no cálculo mensal
		}
	}
	
	return totalMonthly, nil
}

// GetExpensesByCategory agrupa despesas por categoria
func (r *ExpenseRepository) GetExpensesByCategory(familyID uint) ([]struct {
	CategoryID   uint
	CategoryName string
	TotalCents   int64
	Count        int64
}, error) {
	var results []struct {
		CategoryID   uint
		CategoryName string
		TotalCents   int64
		Count        int64
	}
	
	err := r.db.Model(&models.Expense{}).
		Select("category_id, expense_categories.name as category_name, SUM(amount_cents) as total_cents, COUNT(*) as count").
		Joins("JOIN expense_categories ON expense_categories.id = expenses.category_id").
		Where("family_account_id = ? AND is_active = ?", familyID, true).
		Group("category_id, expense_categories.name").
		Order("total_cents DESC").
		Scan(&results).Error
	
	return results, err
}

// GetSplitsByMember busca despesas de um membro específico
func (r *ExpenseRepository) GetSplitsByMember(memberID uint) ([]models.ExpenseSplit, error) {
	var splits []models.ExpenseSplit
	err := r.db.Where("family_member_id = ?", memberID).
		Preload("Expense").
		Preload("Expense.Category").
		Find(&splits).Error
	
	return splits, err
}

// UpdateWithTransaction atualiza uma despesa dentro de uma transação
func (r *ExpenseRepository) UpdateWithTransaction(fn func(*ExpenseRepository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &ExpenseRepository{db: tx}
		return fn(txRepo)
	})
}

// GetByFamilyIDAndType busca despesas de uma família filtradas por tipo
func (r *ExpenseRepository) GetByFamilyIDAndType(familyID uint, expenseType models.ExpenseType) ([]models.Expense, error) {
	var expenses []models.Expense
	err := r.db.Where("family_account_id = ? AND expense_type = ? AND is_active = ?", 
		familyID, expenseType, true).
		Preload("Category").
		Preload("Splits", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "expense_id", "family_member_id", "percentage", "amount_cents")
		}).
		Preload("Splits.FamilyMember", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "family_account_id")
		}).
		Order("created_at DESC").
		Find(&expenses).Error
	
	return expenses, err
}

// CalculateTotalByType calcula total de despesas de um tipo específico (mensal + anual/12)
func (r *ExpenseRepository) CalculateTotalByType(familyID uint, expenseType models.ExpenseType) (int64, error) {
	var expenses []models.Expense
	
	err := r.db.Where("family_account_id = ? AND expense_type = ? AND is_active = ?", 
		familyID, expenseType, true).
		Find(&expenses).Error
	
	if err != nil {
		return 0, err
	}
	
	var total int64
	for _, expense := range expenses {
		switch expense.Frequency {
		case models.ExpenseMonthly:
			total += expense.AmountCents
		case models.ExpenseYearly:
			// Converter anual para mensal (dividir por 12)
			total += expense.AmountCents / 12
		case models.ExpenseOneTime:
			// one_time também conta (aporte único)
			total += expense.AmountCents
		}
	}
	
	return total, nil
}
