package models

import "time"

// INSSBracket representa uma faixa de INSS
type INSSBracket struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Year      int       `gorm:"not null;index" json:"year"` // Ano de vigência
	MinValue  float64   `gorm:"not null" json:"min_value"`  // Valor mínimo em reais
	MaxValue  float64   `gorm:"not null" json:"max_value"`  // Valor máximo em reais (0 = sem limite)
	Rate      float64   `gorm:"not null" json:"rate"`       // Alíquota (ex: 0.075 = 7.5%)
	Order     int       `gorm:"not null" json:"order"`      // Ordem da faixa
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// IRPFBracket representa uma faixa de IRPF
type IRPFBracket struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Year       int       `gorm:"not null;index" json:"year"` // Ano de vigência
	MinValue   float64   `gorm:"not null" json:"min_value"`  // Valor mínimo em reais
	MaxValue   float64   `gorm:"not null" json:"max_value"`  // Valor máximo em reais (0 = sem limite)
	Rate       float64   `gorm:"not null" json:"rate"`       // Alíquota (ex: 0.075 = 7.5%)
	Deduction  float64   `gorm:"not null" json:"deduction"`  // Parcela a deduzir
	Order      int       `gorm:"not null" json:"order"`      // Ordem da faixa
	IsActive   bool      `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// TaxConfiguration armazena configurações gerais de impostos
type TaxConfiguration struct {
	ID                         uint      `gorm:"primaryKey" json:"id"`
	Year                       int       `gorm:"not null;unique" json:"year"`
	INSSDeductionPerDependent  float64   `gorm:"not null" json:"inss_deduction_per_dependent"` // Ex: 189.59
	FGTSRate                   float64   `gorm:"not null" json:"fgts_rate"`                    // Ex: 0.08 (8%)
	IsActive                   bool      `gorm:"default:true" json:"is_active"`
	CreatedAt                  time.Time `json:"created_at"`
	UpdatedAt                  time.Time `json:"updated_at"`
}
