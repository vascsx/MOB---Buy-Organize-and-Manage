package models

import "time"

type EmergencyFund struct {
    ID                  uint      `gorm:"primaryKey" json:"id"`
    FamilyAccountID     uint      `gorm:"unique;not null" json:"family_account_id"`
    TargetMonths        int       `gorm:"not null" json:"target_months"`
    MonthlyExpenses     float64   `gorm:"not null" json:"monthly_expenses"` // custo de vida mensal em reais
    TargetAmount        float64   `gorm:"not null" json:"target_amount"` // calculado em reais
    CurrentAmount       float64   `gorm:"default:0" json:"current_amount"`
    MonthlyGoal         float64   `gorm:"not null" json:"monthly_goal"` // aporte mensal em reais
    EstimatedMonths     int       `gorm:"default:0" json:"estimated_months"`
    CreatedAt           time.Time `json:"created_at"`
    UpdatedAt           time.Time `json:"updated_at"`

    // Relacionamentos
    FamilyAccount FamilyAccount `gorm:"foreignKey:FamilyAccountID" json:"family_account,omitempty"`
}
