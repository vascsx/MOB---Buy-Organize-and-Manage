package models

import "time"

type ExpenseSplit struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ExpenseID      uint      `gorm:"not null;index" json:"expense_id"`
	FamilyMemberID uint      `gorm:"not null;index" json:"family_member_id"`
	Percentage     float64   `gorm:"not null" json:"percentage"` // ex: 50.00 (%)
	AmountCents    int64     `gorm:"not null" json:"amount_cents"` // calculado
	CreatedAt      time.Time `json:"created_at"`

	// Relacionamentos
	Expense      Expense      `gorm:"foreignKey:ExpenseID" json:"expense,omitempty"`
	FamilyMember FamilyMember `gorm:"foreignKey:FamilyMemberID" json:"family_member,omitempty"`
}
