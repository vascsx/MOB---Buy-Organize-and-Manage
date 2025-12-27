package calculation

import (
	"finance-backend/repositories"
	"math"
)

// TaxCalculator gerencia cálculos de impostos com dados do banco
type TaxCalculator struct {
	taxRepo *repositories.TaxRepository
	year    int
}

// NewTaxCalculator cria novo calculador de impostos
func NewTaxCalculator(taxRepo *repositories.TaxRepository) *TaxCalculator {
	return &TaxCalculator{
		taxRepo: taxRepo,
		year:    taxRepo.GetCurrentYear(),
	}
}

// NewTaxCalculatorForYear cria calculador para um ano específico
func NewTaxCalculatorForYear(taxRepo *repositories.TaxRepository, year int) *TaxCalculator {
	return &TaxCalculator{
		taxRepo: taxRepo,
		year:    year,
	}
}

// CalculateINSS calcula o INSS progressivo (em centavos)
func (tc *TaxCalculator) CalculateINSS(grossMonthlyCents int64) int64 {
	brackets, err := tc.taxRepo.GetINSSBrackets(tc.year)
	if err != nil || len(brackets) == 0 {
		// Fallback: usar cálculo padrão se banco falhar
		return calculateINSSFallback(grossMonthlyCents)
	}
	
	grossMonthly := float64(grossMonthlyCents) / 100.0
	var inssTotal float64
	var previousLimit float64
	
	for _, bracket := range brackets {
		if grossMonthly <= previousLimit {
			break
		}
		
		maxValue := bracket.MaxValue
		if maxValue == 0 || maxValue > 999999999 {
			maxValue = math.MaxFloat64
		}
		
		taxableAmount := math.Min(grossMonthly, maxValue) - previousLimit
		if taxableAmount > 0 {
			inssTotal += taxableAmount * bracket.Rate
		}
		previousLimit = maxValue
	}
	
	return int64(math.Round(inssTotal * 100))
}

// CalculateFGTS calcula o FGTS (8% - informativo, não desconta do salário)
func (tc *TaxCalculator) CalculateFGTS(grossMonthlyCents int64) int64 {
	config, err := tc.taxRepo.GetTaxConfiguration(tc.year)
	if err != nil {
		return int64(float64(grossMonthlyCents) * 0.08) // Fallback 8%
	}
	return int64(float64(grossMonthlyCents) * config.FGTSRate)
}

// CalculateIRPF calcula o Imposto de Renda (em centavos)
func (tc *TaxCalculator) CalculateIRPF(grossMonthlyCents, inssCents int64, dependents int) int64 {
	config, err := tc.taxRepo.GetTaxConfiguration(tc.year)
	if err != nil {
		return calculateIRPFFallback(grossMonthlyCents, inssCents, dependents)
	}
	
	brackets, err := tc.taxRepo.GetIRPFBrackets(tc.year)
	if err != nil || len(brackets) == 0 {
		return calculateIRPFFallback(grossMonthlyCents, inssCents, dependents)
	}
	
	grossMonthly := float64(grossMonthlyCents) / 100.0
	inss := float64(inssCents) / 100.0
	
	// Base de cálculo = Bruto - INSS - Dependentes
	taxableBase := grossMonthly - inss - (float64(dependents) * config.INSSDeductionPerDependent)
	
	if taxableBase <= 0 {
		return 0
	}
	
	var irpf float64
	for _, bracket := range brackets {
		maxValue := bracket.MaxValue
		if maxValue == 0 || maxValue > 999999999 {
			maxValue = math.MaxFloat64
		}
		
		if taxableBase <= maxValue {
			irpf = (taxableBase * bracket.Rate) - bracket.Deduction
			break
		}
	}
	
	if irpf < 0 {
		return 0
	}
	
	return int64(math.Round(irpf * 100))
}

// CalculateCLTNet calcula o valor líquido para CLT
func (tc *TaxCalculator) CalculateCLTNet(grossMonthlyCents int64, benefitsCents int64, dependents int) (netCents, inssCents, fgtsCents, irpfCents int64) {
	inssCents = tc.CalculateINSS(grossMonthlyCents)
	fgtsCents = tc.CalculateFGTS(grossMonthlyCents)
	irpfCents = tc.CalculateIRPF(grossMonthlyCents, inssCents, dependents)
	
	netCents = grossMonthlyCents - inssCents - irpfCents + benefitsCents
	
	return
}

// CalculateSimplesTax calcula o imposto do Simples Nacional (em centavos)
func (tc *TaxCalculator) CalculateSimplesTax(grossMonthlyCents int64, rate float64) int64 {
	return int64(float64(grossMonthlyCents) * (rate / 100.0))
}

// CalculatePJNet calcula o valor líquido para PJ
func (tc *TaxCalculator) CalculatePJNet(grossMonthlyCents int64, simplesRate float64, proLaboreCents, benefitsCents int64) (netCents, simplesTaxCents int64) {
	simplesTaxCents = tc.CalculateSimplesTax(grossMonthlyCents, simplesRate)
	netCents = grossMonthlyCents - simplesTaxCents - proLaboreCents + benefitsCents
	
	return
}

// ============================================================
// FALLBACK FUNCTIONS (caso banco esteja indisponível)
// ============================================================

func calculateINSSFallback(grossMonthlyCents int64) int64 {
	// Valores hardcoded de 2025 como fallback
	grossMonthly := float64(grossMonthlyCents) / 100.0
	var inssTotal float64
	var previousLimit float64
	
	brackets := []struct {
		Limit float64
		Rate  float64
	}{
		{1412.00, 0.075},
		{2666.68, 0.09},
		{4000.03, 0.12},
		{7786.02, 0.14},
	}
	
	for _, bracket := range brackets {
		if grossMonthly <= previousLimit {
			break
		}
		taxableAmount := math.Min(grossMonthly, bracket.Limit) - previousLimit
		inssTotal += taxableAmount * bracket.Rate
		previousLimit = bracket.Limit
	}
	
	return int64(math.Round(inssTotal * 100))
}

func calculateIRPFFallback(grossMonthlyCents, inssCents int64, dependents int) int64 {
	// Valores hardcoded de 2025 como fallback
	grossMonthly := float64(grossMonthlyCents) / 100.0
	inss := float64(inssCents) / 100.0
	
	taxableBase := grossMonthly - inss - (float64(dependents) * 189.59)
	
	if taxableBase <= 0 {
		return 0
	}
	
	brackets := []struct {
		Limit     float64
		Rate      float64
		Deduction float64
	}{
		{2259.20, 0.0, 0},
		{2826.65, 0.075, 169.44},
		{3751.05, 0.15, 381.44},
		{4664.68, 0.225, 662.77},
		{math.MaxFloat64, 0.275, 896.00},
	}
	
	var irpf float64
	for _, bracket := range brackets {
		if taxableBase <= bracket.Limit {
			irpf = (taxableBase * bracket.Rate) - bracket.Deduction
			break
		}
	}
	
	if irpf < 0 {
		return 0
	}
	
	return int64(math.Round(irpf * 100))
}

// ============================================================
// LEGACY FUNCTIONS (manter compatibilidade com código existente)
// ============================================================

// CalculateINSS função legada para compatibilidade
func CalculateINSS(grossMonthlyCents int64) int64 {
	return calculateINSSFallback(grossMonthlyCents)
}

// CalculateFGTS função legada para compatibilidade
func CalculateFGTS(grossMonthlyCents int64) int64 {
	return int64(float64(grossMonthlyCents) * 0.08)
}

// CalculateIRPF função legada para compatibilidade
func CalculateIRPF(grossMonthlyCents, inssCents int64, dependents int) int64 {
	return calculateIRPFFallback(grossMonthlyCents, inssCents, dependents)
}

// CalculateCLTNet função legada para compatibilidade
func CalculateCLTNet(grossMonthlyCents int64, benefitsCents int64, dependents int) (netCents, inssCents, fgtsCents, irpfCents int64) {
	inssCents = CalculateINSS(grossMonthlyCents)
	fgtsCents = CalculateFGTS(grossMonthlyCents)
	irpfCents = CalculateIRPF(grossMonthlyCents, inssCents, dependents)
	
	netCents = grossMonthlyCents - inssCents - irpfCents + benefitsCents
	
	return
}

// CalculateSimplesTax função legada para compatibilidade
func CalculateSimplesTax(grossMonthlyCents int64, rate float64) int64 {
	return int64(float64(grossMonthlyCents) * (rate / 100.0))
}

// CalculatePJNet função legada para compatibilidade
func CalculatePJNet(grossMonthlyCents int64, simplesRate float64, proLaboreCents, benefitsCents int64) (netCents, simplesTaxCents int64) {
	simplesTaxCents = CalculateSimplesTax(grossMonthlyCents, simplesRate)
	netCents = grossMonthlyCents - simplesTaxCents - proLaboreCents + benefitsCents
	
	return
}
