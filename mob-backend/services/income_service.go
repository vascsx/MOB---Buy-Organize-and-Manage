package services

import (
	"errors"
	"finance-backend/models"
	"finance-backend/repositories"
	"finance-backend/services/calculation"
	"finance-backend/utils"
)

type IncomeService struct {
	incomeRepo *repositories.IncomeRepository
	familyRepo *repositories.FamilyRepository
}

func NewIncomeService(incomeRepo *repositories.IncomeRepository, familyRepo *repositories.FamilyRepository) *IncomeService {
	return &IncomeService{
		incomeRepo: incomeRepo,
		familyRepo: familyRepo,
	}
}

// CreateIncome cria uma nova renda usando o valor líquido informado
func (s *IncomeService) CreateIncome(income *models.Income) error {
	// Validações
	validator := utils.NewValidator()
	
	validator.Add(utils.ValidateIncomeType(string(income.Type)))
	validator.Add(utils.ValidatePositiveAmount(income.NetMonthlyCents, "net_monthly_cents"))
	
	if income.Type == models.IncomePJ {
		validator.Add(utils.ValidatePercentage(income.SimplesNacionalRate, "simples_nacional_rate"))
	}
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	// Se gross_monthly_cents não foi informado, usar o net_monthly_cents como base
	if income.GrossMonthlyCents == 0 {
		income.GrossMonthlyCents = income.NetMonthlyCents
	}
	
	// Usar transação para garantir atomicidade
	return s.incomeRepo.CreateWithTransaction(func(repo *repositories.IncomeRepository) error {
		// Desativar outras rendas do mesmo membro (apenas uma ativa por vez)
		if income.IsActive {
			err := repo.DeactivateOtherIncomes(income.FamilyMemberID, 0)
			if err != nil {
				return err
			}
		}
		
		// Criar nova renda
		return repo.Create(income)
	})
}

// UpdateIncome atualiza uma renda usando o valor líquido informado
func (s *IncomeService) UpdateIncome(income *models.Income) error {
	// Validações
	validator := utils.NewValidator()
	
	validator.Add(utils.ValidateIncomeType(string(income.Type)))
	validator.Add(utils.ValidatePositiveAmount(income.NetMonthlyCents, "net_monthly_cents"))
	
	if income.Type == models.IncomePJ {
		validator.Add(utils.ValidatePercentage(income.SimplesNacionalRate, "simples_nacional_rate"))
	}
	
	if validator.HasErrors() {
		return validator.GetErrors()
	}
	
	// Se gross_monthly_cents não foi informado, usar o net_monthly_cents como base
	if income.GrossMonthlyCents == 0 {
		income.GrossMonthlyCents = income.NetMonthlyCents
	}
	
	// Usar transação para garantir atomicidade
	return s.incomeRepo.UpdateWithTransaction(func(repo *repositories.IncomeRepository) error {
		// Se está ativando esta renda, desativar outras
		if income.IsActive {
			err := repo.DeactivateOtherIncomes(income.FamilyMemberID, income.ID)
			if err != nil {
				return err
			}
		}
		
		// Atualizar renda
		return repo.Update(income)
	})
}

// CalculateNetIncome calcula o valor líquido baseado no tipo de renda
func (s *IncomeService) CalculateNetIncome(income *models.Income) {
	totalBenefits := income.FoodVoucherCents + income.TransportVoucherCents + income.BonusCents
	
	if income.Type == models.IncomeCLT {
		// Cálculo CLT
		netCents, inssCents, fgtsCents, irpfCents := calculation.CalculateCLTNet(
			income.GrossMonthlyCents,
			totalBenefits,
			0, // dependentes (pode adicionar depois)
		)
		
		income.INSSCents = inssCents
		income.FGTSCents = fgtsCents
		income.IRPFCents = irpfCents
		income.NetMonthlyCents = netCents
		
	} else if income.Type == models.IncomePJ {
		// Cálculo PJ
		netCents, simplesTaxCents := calculation.CalculatePJNet(
			income.GrossMonthlyCents,
			income.SimplesNacionalRate,
			income.ProLaboreCents,
			totalBenefits,
		)
		
		// Para PJ, guardar o imposto no campo IRPF (reutilizando)
		income.IRPFCents = simplesTaxCents
		income.INSSCents = 0
		income.FGTSCents = 0
		income.NetMonthlyCents = netCents
	}
}

// GetIncomeByID busca renda por ID
func (s *IncomeService) GetIncomeByID(id uint) (*models.Income, error) {
	return s.incomeRepo.GetByID(id)
}

// GetIncomesByMemberID busca rendas de um membro
func (s *IncomeService) GetIncomesByMemberID(memberID uint) ([]models.Income, error) {
	return s.incomeRepo.GetByMemberID(memberID)
}

// GetIncomesByFamilyID busca rendas de uma família
func (s *IncomeService) GetIncomesByFamilyID(familyID uint) ([]models.Income, error) {
	return s.incomeRepo.GetByFamilyID(familyID)
}

// GetFamilyTotalIncome calcula renda líquida total da família
func (s *IncomeService) GetFamilyTotalIncome(familyID uint) (int64, error) {
	return s.incomeRepo.CalculateTotalFamilyIncome(familyID)
}

// DeleteIncome desativa uma renda
func (s *IncomeService) DeleteIncome(id uint) error {
	return s.incomeRepo.Delete(id)
}

// GetIncomeBreakdown retorna detalhamento de renda com impostos
func (s *IncomeService) GetIncomeBreakdown(id uint) (*IncomeBreakdown, error) {
	income, err := s.incomeRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	
	breakdown := &IncomeBreakdown{
		Income:       income,
		GrossAmount:  utils.CentsToFloat(income.GrossMonthlyCents),
		NetAmount:    utils.CentsToFloat(income.NetMonthlyCents),
		TotalTax:     utils.CentsToFloat(income.INSSCents + income.IRPFCents),
		Benefits:     utils.CentsToFloat(income.FoodVoucherCents + income.TransportVoucherCents + income.BonusCents),
	}
	
	if income.Type == models.IncomeCLT {
		breakdown.Taxes = map[string]float64{
			"INSS": utils.CentsToFloat(income.INSSCents),
			"IRPF": utils.CentsToFloat(income.IRPFCents),
			"FGTS": utils.CentsToFloat(income.FGTSCents),
		}
	} else {
		breakdown.Taxes = map[string]float64{
			"Simples Nacional": utils.CentsToFloat(income.IRPFCents),
		}
		if income.ProLaboreCents > 0 {
			breakdown.Taxes["Pró-labore"] = utils.CentsToFloat(income.ProLaboreCents)
		}
	}
	
	return breakdown, nil
}

// IncomeBreakdown representa o detalhamento de uma renda
type IncomeBreakdown struct {
	Income      *models.Income     `json:"income"`
	GrossAmount float64            `json:"gross_amount"`
	NetAmount   float64            `json:"net_amount"`
	TotalTax    float64            `json:"total_tax"`
	Benefits    float64            `json:"benefits"`
	Taxes       map[string]float64 `json:"taxes"`
}

// GetFamilyIncomeSummary retorna resumo de todas as rendas da família
func (s *IncomeService) GetFamilyIncomeSummary(familyID uint) (*FamilyIncomeSummary, error) {
	incomes, err := s.incomeRepo.GetByFamilyID(familyID)
	if err != nil {
		return nil, err
	}
	
	if len(incomes) == 0 {
		return &FamilyIncomeSummary{
			TotalGross: 0,
			TotalNet:   0,
			TotalTax:   0,
			Members:    []MemberIncome{},
		}, nil
	}
	
	var totalGross, totalNet, totalTax int64
	memberIncomes := []MemberIncome{}
	
	for _, income := range incomes {
		totalGross += income.GrossMonthlyCents
		totalNet += income.NetMonthlyCents
		totalTax += income.INSSCents + income.IRPFCents
		
		memberIncomes = append(memberIncomes, MemberIncome{
			MemberID:   income.FamilyMemberID,
			MemberName: income.FamilyMember.Name,
			Type:       string(income.Type),
			Gross:      utils.CentsToFloat(income.GrossMonthlyCents),
			Net:        utils.CentsToFloat(income.NetMonthlyCents),
			Tax:        utils.CentsToFloat(income.INSSCents + income.IRPFCents),
		})
	}
	
	return &FamilyIncomeSummary{
		TotalGross: utils.CentsToFloat(totalGross),
		TotalNet:   utils.CentsToFloat(totalNet),
		TotalTax:   utils.CentsToFloat(totalTax),
		Members:    memberIncomes,
	}, nil
}

type FamilyIncomeSummary struct {
	TotalGross float64        `json:"total_gross"`
	TotalNet   float64        `json:"total_net"`
	TotalTax   float64        `json:"total_tax"`
	Members    []MemberIncome `json:"members"`
}

type MemberIncome struct {
	MemberID   uint    `json:"member_id"`
	MemberName string  `json:"member_name"`
	Type       string  `json:"type"`
	Gross      float64 `json:"gross"`
	Net        float64 `json:"net"`
	Tax        float64 `json:"tax"`
}

// ValidateMemberAccess valida se um membro pertence a uma família
func (s *IncomeService) ValidateMemberAccess(memberID, familyID uint) error {
	member, err := s.familyRepo.GetMemberByID(memberID)
	if err != nil {
		return errors.New("membro não encontrado")
	}
	
	if member.FamilyAccountID != familyID {
		return errors.New("membro não pertence a esta família")
	}
	
	return nil
}

// ValidateMemberBelongsToFamily valida usando repositório otimizado
func (s *IncomeService) ValidateMemberBelongsToFamily(memberID, familyID uint) error {
	belongs, err := s.familyRepo.MemberBelongsToFamily(memberID, familyID)
	if err != nil {
		return err
	}
	
	if !belongs {
		return errors.New("membro não pertence a esta família")
	}
	
	return nil
}
