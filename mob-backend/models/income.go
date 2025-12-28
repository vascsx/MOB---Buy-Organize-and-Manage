package models

import "time"

type IncomeType string

const (
	IncomeCLT IncomeType = "CLT"
	IncomePJ  IncomeType = "PJ"
)

type Income struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	FamilyMemberID uint       `gorm:"not null;index" json:"family_member_id"`
	Type           IncomeType `gorm:"not null" json:"type"`

	// Valores em centavos (int64)
	GrossMonthlyCents int64 `gorm:"default:0" json:"gross_monthly_cents"` // renda bruta (opcional)

	// Benefícios (opcionais)
	FoodVoucherCents      int64 `gorm:"default:0" json:"food_voucher_cents"`
	TransportVoucherCents int64 `gorm:"default:0" json:"transport_voucher_cents"`
	BonusCents            int64 `gorm:"default:0" json:"bonus_cents"`

	// Para PJ
	SimplesNacionalRate float64 `gorm:"default:0" json:"simples_nacional_rate"` // ex: 6.5 (%)
	ProLaboreCents      int64   `gorm:"default:0" json:"pro_labore_cents"`

	// Para CLT (calculado automaticamente)
	INSSCents int64 `gorm:"default:0" json:"inss_cents"`
	FGTSCents int64 `gorm:"default:0" json:"fgts_cents"`
	IRPFCents int64 `gorm:"default:0" json:"irpf_cents"`

	// Líquido (obrigatório)
	NetMonthlyCents int64 `gorm:"not null" json:"net_monthly_cents"`

	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	// Campos de referência mensal para histórico
	ReferenceMonth int `gorm:"not null;default:EXTRACT(MONTH FROM CURRENT_DATE)" json:"reference_month"`
	ReferenceYear  int `gorm:"not null;default:EXTRACT(YEAR FROM CURRENT_DATE)" json:"reference_year"`

	// Relacionamentos
	FamilyMember FamilyMember `gorm:"foreignKey:FamilyMemberID" json:"family_member,omitempty"`
}
