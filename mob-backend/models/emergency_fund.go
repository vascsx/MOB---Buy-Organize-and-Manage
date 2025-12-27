package models

import "time"

type EmergencyFund struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	FamilyAccountID    uint      `gorm:"unique;not null" json:"family_account_id"`
	TargetMonths       int       `gorm:"not null" json:"target_months"` // ex: 6 meses
	TargetAmountCents  int64     `gorm:"not null" json:"target_amount_cents"` // calculado
	CurrentAmountCents int64     `gorm:"default:0" json:"current_amount_cents"`
	MonthlyGoalCents   int64     `gorm:"not null" json:"monthly_goal_cents"` // aporte mensal
	EstimatedMonths    int       `gorm:"default:0" json:"estimated_months"` // meses para atingir
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Relacionamentos
	FamilyAccount FamilyAccount `gorm:"foreignKey:FamilyAccountID" json:"family_account,omitempty"`
}
