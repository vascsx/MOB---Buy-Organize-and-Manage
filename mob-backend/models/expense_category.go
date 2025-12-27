package models

type ExpenseCategory struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `gorm:"unique;not null" json:"name"` // ex: "Moradia", "Alimentação"
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	IsDefault bool   `gorm:"default:false" json:"is_default"`

	// Relacionamentos
	Expenses []Expense `gorm:"foreignKey:CategoryID" json:"expenses,omitempty"`
}
