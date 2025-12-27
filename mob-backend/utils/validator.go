package utils

import (
	"fmt"
	"regexp"
)

// ValidationError representa um erro de validação
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidationErrors é uma coleção de erros de validação
type ValidationErrors []ValidationError

func (e ValidationErrors) Error() string {
	if len(e) == 0 {
		return ""
	}
	return fmt.Sprintf("validation failed: %d error(s)", len(e))
}

// HasErrors verifica se há erros
func (e ValidationErrors) HasErrors() bool {
	return len(e) > 0
}

// ValidatePositiveAmount valida se um valor é positivo
func ValidatePositiveAmount(amount int64, fieldName string) error {
	if amount <= 0 {
		return ValidationError{
			Field:   fieldName,
			Message: "deve ser um valor positivo",
		}
	}
	return nil
}

// ValidateNonNegativeAmount valida se um valor não é negativo
func ValidateNonNegativeAmount(amount int64, fieldName string) error {
	if amount < 0 {
		return ValidationError{
			Field:   fieldName,
			Message: "não pode ser negativo",
		}
	}
	return nil
}

// ValidatePercentage valida se uma porcentagem está entre 0 e 100
func ValidatePercentage(percentage float64, fieldName string) error {
	if percentage < 0 || percentage > 100 {
		return ValidationError{
			Field:   fieldName,
			Message: "deve estar entre 0 e 100",
		}
	}
	return nil
}

// ValidateExpenseSplits valida se os splits somam 100%
func ValidateExpenseSplits(splits []struct {
	FamilyMemberID uint
	Percentage     float64
}) error {
	if len(splits) == 0 {
		return ValidationError{
			Field:   "splits",
			Message: "pelo menos um membro deve ser atribuído",
		}
	}
	
	totalPercentage := 0.0
	memberMap := make(map[uint]bool)
	
	for _, split := range splits {
		// Validar porcentagem individual
		if err := ValidatePercentage(split.Percentage, "percentage"); err != nil {
			return err
		}
		
		// Verificar duplicatas
		if memberMap[split.FamilyMemberID] {
			return ValidationError{
				Field:   "splits",
				Message: fmt.Sprintf("membro %d aparece mais de uma vez", split.FamilyMemberID),
			}
		}
		memberMap[split.FamilyMemberID] = true
		
		totalPercentage += split.Percentage
	}
	
	// Tolerância para arredondamento
	if totalPercentage < 99.99 || totalPercentage > 100.01 {
		return ValidationError{
			Field:   "splits",
			Message: fmt.Sprintf("a soma das porcentagens deve ser 100%% (atual: %.2f%%)", totalPercentage),
		}
	}
	
	return nil
}

// ValidateRequiredString valida se uma string não está vazia
func ValidateRequiredString(value, fieldName string) error {
	if value == "" {
		return ValidationError{
			Field:   fieldName,
			Message: "é obrigatório",
		}
	}
	return nil
}

// ValidateEmail valida formato de email
func ValidateEmail(email string) error {
	if email == "" {
		return ValidationError{
			Field:   "email",
			Message: "é obrigatório",
		}
	}
	
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return ValidationError{
			Field:   "email",
			Message: "formato inválido",
		}
	}
	
	return nil
}

// ValidatePasswordStrength valida força da senha
func ValidatePasswordStrength(password string) error {
	if password == "" {
		return ValidationError{
			Field:   "password",
			Message: "é obrigatório",
		}
	}
	
	if len(password) < 8 {
		return ValidationError{
			Field:   "password",
			Message: "deve ter no mínimo 8 caracteres",
		}
	}
	
	// Verificar se contém letra e número
	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	
	if !hasLetter || !hasNumber {
		return ValidationError{
			Field:   "password",
			Message: "deve conter letras e números",
		}
	}
	
	return nil
}

// ValidateRange valida se um valor está dentro de um intervalo
func ValidateRange(value int, min, max int, fieldName string) error {
	if value < min || value > max {
		return ValidationError{
			Field:   fieldName,
			Message: fmt.Sprintf("deve estar entre %d e %d", min, max),
		}
	}
	return nil
}

// ValidateDueDay valida dia de vencimento (1-31)
func ValidateDueDay(day int) error {
	return ValidateRange(day, 1, 31, "due_day")
}

// ValidateTargetMonths valida meses de reserva de emergência (mínimo 3)
func ValidateTargetMonths(months int) error {
	if months < 3 {
		return ValidationError{
			Field:   "target_months",
			Message: "deve ser no mínimo 3 meses",
		}
	}
	if months > 24 {
		return ValidationError{
			Field:   "target_months",
			Message: "não deve exceder 24 meses",
		}
	}
	return nil
}

// ValidateAnnualReturnRate valida taxa de retorno anual
func ValidateAnnualReturnRate(rate float64) error {
	if rate < -100 || rate > 1000 {
		return ValidationError{
			Field:   "annual_return_rate",
			Message: "taxa de retorno inválida",
		}
	}
	return nil
}

// ValidateIncomeType valida tipo de renda
func ValidateIncomeType(incomeType string) error {
	validTypes := map[string]bool{
		"CLT": true,
		"PJ":  true,
	}
	
	if !validTypes[incomeType] {
		return ValidationError{
			Field:   "type",
			Message: "deve ser CLT ou PJ",
		}
	}
	
	return nil
}

// ValidateExpenseFrequency valida frequência de despesa
func ValidateExpenseFrequency(frequency string) error {
	validFrequencies := map[string]bool{
		"monthly":  true,
		"yearly":   true,
		"one_time": true,
	}
	
	if !validFrequencies[frequency] {
		return ValidationError{
			Field:   "frequency",
			Message: "deve ser monthly, yearly ou one_time",
		}
	}
	
	return nil
}

// ValidateInvestmentType valida tipo de investimento
func ValidateInvestmentType(investmentType string) error {
	validTypes := map[string]bool{
		"renda_fixa":     true,
		"renda_variavel": true,
		"fundos":         true,
		"crypto":         true,
		"imoveis":        true,
	}
	
	if !validTypes[investmentType] {
		return ValidationError{
			Field:   "type",
			Message: "tipo de investimento inválido",
		}
	}
	
	return nil
}

// Validator é um helper para coletar múltiplos erros de validação
type Validator struct {
	Errors ValidationErrors
}

// NewValidator cria um novo validator
func NewValidator() *Validator {
	return &Validator{
		Errors: ValidationErrors{},
	}
}

// Add adiciona um erro de validação
func (v *Validator) Add(err error) {
	if err != nil {
		if valErr, ok := err.(ValidationError); ok {
			v.Errors = append(v.Errors, valErr)
		}
	}
}

// HasErrors verifica se há erros
func (v *Validator) HasErrors() bool {
	return len(v.Errors) > 0
}

// GetErrors retorna os erros
func (v *Validator) GetErrors() ValidationErrors {
	return v.Errors
}
