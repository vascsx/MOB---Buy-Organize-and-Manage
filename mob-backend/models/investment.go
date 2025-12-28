package models

import "time"

type InvestmentType string

const (
	InvestmentFixedIncome    InvestmentType = "renda_fixa"
	InvestmentVariableIncome InvestmentType = "renda_variavel"
	InvestmentFunds          InvestmentType = "fundos"
	InvestmentCrypto         InvestmentType = "crypto"
	InvestmentRealEstate     InvestmentType = "imoveis"
)

type Investment struct {
	ID                       uint           `gorm:"primaryKey" json:"id"`
	FamilyAccountID          uint           `gorm:"not null;index" json:"family_account_id"`
	Name                     string         `gorm:"not null" json:"name"` // ex: "Tesouro Selic"
	Type                     InvestmentType `gorm:"not null" json:"type"`
	MonthlyContributionCents int64          `gorm:"not null" json:"monthly_contribution_cents"`
	CurrentBalanceCents      int64          `gorm:"default:0" json:"current_balance_cents"`
	AnnualReturnRate         float64        `gorm:"not null" json:"annual_return_rate"` // ex: 10.5 (%)
	StartDate                time.Time      `json:"start_date"`
	IsActive                 bool           `gorm:"default:true" json:"is_active"`
	CreatedAt                time.Time      `json:"created_at"`
	UpdatedAt                time.Time      `json:"updated_at"`
	
	// Campos de referência mensal para histórico
	ReferenceMonth int `gorm:"not null;default:EXTRACT(MONTH FROM CURRENT_DATE)" json:"reference_month"`
	ReferenceYear  int `gorm:"not null;default:EXTRACT(YEAR FROM CURRENT_DATE)" json:"reference_year"`

	// Relacionamentos
	FamilyAccount FamilyAccount `gorm:"foreignKey:FamilyAccountID" json:"family_account,omitempty"`
}
