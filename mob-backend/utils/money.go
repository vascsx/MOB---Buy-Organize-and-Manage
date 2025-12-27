package utils

import (
	"fmt"
	"math"
)

// CentsToFloat converte centavos (int64) para reais (float64)
func CentsToFloat(cents int64) float64 {
	return float64(cents) / 100.0
}

// FloatToCents converte reais (float64) para centavos (int64)
// Usa arredondamento para evitar problemas de precisão
func FloatToCents(value float64) int64 {
	return int64(math.Round(value * 100.0))
}

// FormatMoney formata centavos para string em formato brasileiro
// Ex: 150000 -> "R$ 1.500,00"
func FormatMoney(cents int64) string {
	value := CentsToFloat(cents)
	
	// Formatar com separadores brasileiros
	negative := ""
	if value < 0 {
		negative = "-"
		value = -value
	}
	
	// Separar parte inteira e decimal
	intPart := int64(value)
	decimalPart := int64((value - float64(intPart)) * 100)
	
	// Formatar parte inteira com separador de milhares
	intStr := formatWithThousandsSeparator(intPart)
	
	return fmt.Sprintf("%sR$ %s,%02d", negative, intStr, decimalPart)
}

// formatWithThousandsSeparator adiciona pontos como separador de milhares
func formatWithThousandsSeparator(n int64) string {
	if n < 1000 {
		return fmt.Sprintf("%d", n)
	}
	
	str := fmt.Sprintf("%d", n)
	length := len(str)
	
	// Adicionar pontos a cada 3 dígitos da direita para esquerda
	result := ""
	for i, digit := range str {
		if i > 0 && (length-i)%3 == 0 {
			result += "."
		}
		result += string(digit)
	}
	
	return result
}

// FormatMoneyCompact formata sem o símbolo R$ (útil para inputs)
// Ex: 150000 -> "1.500,00"
func FormatMoneyCompact(cents int64) string {
	value := CentsToFloat(cents)
	
	negative := ""
	if value < 0 {
		negative = "-"
		value = -value
	}
	
	intPart := int64(value)
	decimalPart := int64((value - float64(intPart)) * 100)
	intStr := formatWithThousandsSeparator(intPart)
	
	return fmt.Sprintf("%s%s,%02d", negative, intStr, decimalPart)
}

// ParseMoneyString converte string brasileira para centavos
// Ex: "R$ 1.500,00" ou "1.500,00" -> 150000
func ParseMoneyString(str string) (int64, error) {
	// Remove caracteres não numéricos exceto vírgula
	cleaned := ""
	hasComma := false
	
	for _, char := range str {
		if char >= '0' && char <= '9' {
			cleaned += string(char)
		} else if char == ',' && !hasComma {
			cleaned += "."
			hasComma = true
		}
	}
	
	if cleaned == "" {
		return 0, fmt.Errorf("string inválida")
	}
	
	var value float64
	_, err := fmt.Sscanf(cleaned, "%f", &value)
	if err != nil {
		return 0, err
	}
	
	return FloatToCents(value), nil
}

// CalculatePercentage calcula a porcentagem de um valor
// Ex: CalculatePercentage(100000, 10.5) -> 10500 (10.5% de R$ 1000,00)
func CalculatePercentage(cents int64, percentage float64) int64 {
	return int64(math.Round(float64(cents) * (percentage / 100.0)))
}

// CalculatePercentageOf calcula qual porcentagem um valor representa
// Ex: CalculatePercentageOf(50000, 100000) -> 50.0 (R$ 500 é 50% de R$ 1000)
func CalculatePercentageOf(part, total int64) float64 {
	if total == 0 {
		return 0
	}
	return (float64(part) / float64(total)) * 100.0
}

// SumCents soma múltiplos valores em centavos
func SumCents(values ...int64) int64 {
	sum := int64(0)
	for _, v := range values {
		sum += v
	}
	return sum
}

// MaxCents retorna o maior valor entre os fornecidos
func MaxCents(values ...int64) int64 {
	if len(values) == 0 {
		return 0
	}
	max := values[0]
	for _, v := range values[1:] {
		if v > max {
			max = v
		}
	}
	return max
}

// MinCents retorna o menor valor entre os fornecidos
func MinCents(values ...int64) int64 {
	if len(values) == 0 {
		return 0
	}
	min := values[0]
	for _, v := range values[1:] {
		if v < min {
			min = v
		}
	}
	return min
}
