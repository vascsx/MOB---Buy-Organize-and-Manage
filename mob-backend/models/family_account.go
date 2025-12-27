package models

import "time"

type FamilyAccount struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"` // ex: "Família Silva"
	OwnerUserID uint    `gorm:"not null;index" json:"owner_user_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relacionamentos
	Owner         User              `gorm:"foreignKey:OwnerUserID" json:"owner,omitempty"`
	Members       []FamilyMember    `gorm:"foreignKey:FamilyAccountID" json:"members,omitempty"`
	Expenses      []Expense         `gorm:"foreignKey:FamilyAccountID" json:"expenses,omitempty"`
	Investments   []Investment      `gorm:"foreignKey:FamilyAccountID" json:"investments,omitempty"`
	EmergencyFund *EmergencyFund    `gorm:"foreignKey:FamilyAccountID" json:"emergency_fund,omitempty"`
}
