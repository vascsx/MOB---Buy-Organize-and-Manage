package models

import "time"

type ExpenseFrequency string

const (
	ExpenseMonthly ExpenseFrequency = "monthly"
	ExpenseYearly  ExpenseFrequency = "yearly"
	ExpenseOneTime ExpenseFrequency = "one_time"
)

type Expense struct {
	ID              uint             `gorm:"primaryKey" json:"id"`
	FamilyAccountID uint             `gorm:"not null;index" json:"family_account_id"`
	CategoryID      uint             `gorm:"not null" json:"category_id"`
	Name            string           `gorm:"not null" json:"name"` // ex: "Aluguel"
	Description     string           `json:"description"`
	AmountCents     int64            `gorm:"not null" json:"amount_cents"`
	Frequency       ExpenseFrequency `gorm:"default:'monthly'" json:"frequency"`
	DueDay          int              `gorm:"default:1" json:"due_day"` // dia do vencimento (1-31)
	IsFixed         bool             `gorm:"default:true" json:"is_fixed"`
	IsActive        bool             `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`

	// Relacionamentos
	FamilyAccount FamilyAccount  `gorm:"foreignKey:FamilyAccountID" json:"family_account,omitempty"`
	Category      ExpenseCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Splits        []ExpenseSplit  `gorm:"foreignKey:ExpenseID" json:"splits,omitempty"`
}
