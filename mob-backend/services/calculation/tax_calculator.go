package calculation

import "math"

// Faixas de INSS 2025 (progressivo)
type INSSBracket struct {
	Limit float64
	Rate  float64
}

var inssBrackets = []INSSBracket{
	{Limit: 1412.00, Rate: 0.075},  // 7.5%
	{Limit: 2666.68, Rate: 0.09},   // 9%
	{Limit: 4000.03, Rate: 0.12},   // 12%
	{Limit: 7786.02, Rate: 0.14},   // 14%
}

// Faixas de IRPF 2025 (progressivo)
type IRPFBracket struct {
	Limit     float64
	Rate      float64
	Deduction float64
}

var irpfBrackets = []IRPFBracket{
	{Limit: 2259.20, Rate: 0.0, Deduction: 0},
	{Limit: 2826.65, Rate: 0.075, Deduction: 169.44},
	{Limit: 3751.05, Rate: 0.15, Deduction: 381.44},
	{Limit: 4664.68, Rate: 0.225, Deduction: 662.77},
	{Limit: math.MaxFloat64, Rate: 0.275, Deduction: 896.00},
}

const inssDeductionPerDependent = 189.59

// CalculateINSS calcula o INSS progressivo (em centavos)
func CalculateINSS(grossMonthlyCents int64) int64 {
	grossMonthly := float64(grossMonthlyCents) / 100.0
	
	var inssTotal float64
	var previousLimit float64
	
	for _, bracket := range inssBrackets {
		if grossMonthly <= previousLimit {
			break
		}
		
		taxableAmount := math.Min(grossMonthly, bracket.Limit) - previousLimit
		inssTotal += taxableAmount * bracket.Rate
		previousLimit = bracket.Limit
	}
	
	return int64(math.Round(inssTotal * 100))
}

// CalculateFGTS calcula o FGTS (8% - informativo, não desconta do salário)
func CalculateFGTS(grossMonthlyCents int64) int64 {
	return int64(float64(grossMonthlyCents) * 0.08)
}

// CalculateIRPF calcula o Imposto de Renda (em centavos)
func CalculateIRPF(grossMonthlyCents, inssCents int64, dependents int) int64 {
	grossMonthly := float64(grossMonthlyCents) / 100.0
	inss := float64(inssCents) / 100.0
	
	// Base de cálculo = Bruto - INSS - Dependentes
	taxableBase := grossMonthly - inss - (float64(dependents) * inssDeductionPerDependent)
	
	if taxableBase <= 0 {
		return 0
	}
	
	var irpf float64
	for _, bracket := range irpfBrackets {
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

// CalculateCLTNet calcula o valor líquido para CLT
func CalculateCLTNet(grossMonthlyCents int64, benefitsCents int64, dependents int) (netCents, inssCents, fgtsCents, irpfCents int64) {
	inssCents = CalculateINSS(grossMonthlyCents)
	fgtsCents = CalculateFGTS(grossMonthlyCents)
	irpfCents = CalculateIRPF(grossMonthlyCents, inssCents, dependents)
	
	netCents = grossMonthlyCents - inssCents - irpfCents + benefitsCents
	
	return
}

// CalculateSimplesTax calcula o imposto do Simples Nacional (em centavos)
func CalculateSimplesTax(grossMonthlyCents int64, rate float64) int64 {
	return int64(float64(grossMonthlyCents) * (rate / 100.0))
}

// CalculatePJNet calcula o valor líquido para PJ
func CalculatePJNet(grossMonthlyCents int64, simplesRate float64, proLaboreCents, benefitsCents int64) (netCents, simplesTaxCents int64) {
	simplesTaxCents = CalculateSimplesTax(grossMonthlyCents, simplesRate)
	netCents = grossMonthlyCents - simplesTaxCents - proLaboreCents + benefitsCents
	
	return
}
