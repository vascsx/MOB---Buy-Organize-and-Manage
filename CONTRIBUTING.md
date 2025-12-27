# Guia de Contribuição - MOB Finance

## 📋 Índice

1. [Começando](#começando)
2. [Padrões de Código](#padrões-de-código)
3. [Estrutura de Commits](#estrutura-de-commits)
4. [Criando Features](#criando-features)
5. [Testes](#testes)
6. [Code Review](#code-review)
7. [Boas Práticas](#boas-práticas)

---

## 🚀 Começando

### 1. Fork e Clone

```bash
# Fork no GitHub primeiro, depois:
git clone https://github.com/seu-usuario/MOB---Buy-Organize-and-Manage.git
cd MOB---Buy-Organize-and-Manage

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original/MOB---Buy-Organize-and-Manage.git
```

### 2. Configurar Ambiente

```bash
# Copie .env.example
cp .env.example .env

# Gere JWT_SECRET seguro
openssl rand -base64 32

# Edite .env e cole o JWT_SECRET gerado

# Inicie os containers
docker-compose up -d
```

### 3. Crie uma Branch

```bash
# Para nova feature
git checkout -b feature/nome-da-feature

# Para correção de bug
git checkout -b fix/descricao-do-bug

# Para melhorias de documentação
git checkout -b docs/descricao-da-melhoria
```

---

## 📝 Padrões de Código

### Backend (Go)

#### Naming Conventions

```go
// ✅ BOM: PascalCase para exportados
type FamilyAccount struct {
    ID   uint
    Name string
}

// ✅ BOM: camelCase para não exportados
func calculateTotalIncome() int64 {
    return 0
}

// ✅ BOM: ALL_CAPS para constantes
const MAX_FAMILY_MEMBERS = 10

// ❌ EVITE: snake_case em Go
func calculate_total_income() int64 {} // ERRADO
```

#### Monetary Values

```go
// ✅ SEMPRE use int64 para valores monetários (centavos)
type Income struct {
    GrossMonthlyCents int64 `json:"gross_monthly_cents"`
    NetMonthlyCents   int64 `json:"net_monthly_cents"`
}

// ❌ NUNCA use float64 para dinheiro
type Income struct {
    GrossMonthly float64 // ERRADO! Perde precisão
}

// ✅ Converta apenas na apresentação
amount := utils.CentsToFloat(incomeCents) // R$ 5000.50
```

#### Error Handling

```go
// ✅ BOM: Retorne erros, não panic
func GetIncome(id uint) (*Income, error) {
    var income Income
    if err := db.First(&income, id).Error; err != nil {
        return nil, err // Propaga o erro
    }
    return &income, nil
}

// ❌ EVITE: panic em código de aplicação
func GetIncome(id uint) *Income {
    var income Income
    db.First(&income, id) // Se falhar, panic! ERRADO
    return &income
}
```

#### Repository Pattern

```go
// ✅ BOM: Interface clara
type IncomeRepository interface {
    Create(income *Income) error
    GetByID(id uint) (*Income, error)
    GetByFamilyMember(memberID uint) ([]Income, error)
    Update(income *Income) error
    Delete(id uint) error
}

// ✅ Sempre filtre por tenant (family_id)
func (r *IncomeRepository) GetByFamilyMember(memberID uint) ([]Income, error) {
    var incomes []Income
    err := r.db.Joins("JOIN family_members ON incomes.family_member_id = family_members.id").
        Where("family_members.family_account_id = ? AND incomes.family_member_id = ?", r.familyID, memberID).
        Find(&incomes).Error
    return incomes, err
}
```

#### Service Layer

```go
// ✅ BOM: Validações no service
func (s *ExpenseService) CreateExpense(req CreateExpenseRequest) (*Expense, error) {
    // Valida splits
    if err := validator.ValidateExpenseSplits(req.Splits); err != nil {
        return nil, err
    }
    
    // Lógica de negócio
    expense := &Expense{
        FamilyAccountID: s.familyID,
        AmountCents:     utils.FloatToCents(req.Amount),
        // ...
    }
    
    // Persiste
    if err := s.expenseRepo.Create(expense); err != nil {
        return nil, err
    }
    
    return expense, nil
}
```

#### Controllers

```go
// ✅ BOM: Controller limpo, sem lógica de negócio
func (c *IncomeController) CreateIncome(ctx *gin.Context) {
    var req CreateIncomeRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(400, utils.ErrorResponse("Dados inválidos", err.Error()))
        return
    }
    
    // Delega ao service
    income, err := c.incomeService.CreateIncome(req)
    if err != nil {
        ctx.JSON(500, utils.ErrorResponse("Erro ao criar renda", err.Error()))
        return
    }
    
    ctx.JSON(201, utils.SuccessResponse(income))
}
```

### Frontend (React)

#### Component Structure

```jsx
// ✅ BOM: Functional components com hooks
import React, { useState, useEffect } from 'react';

function ExpenseForm({ familyId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/families/${familyId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ amount })
      });
      
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}

export default ExpenseForm;
```

---

## 🔧 Estrutura de Commits

### Formato

```
<tipo>(<escopo>): <descrição curta>

<corpo detalhado (opcional)>

<rodapé (opcional)>
```

### Tipos

- **feat:** Nova funcionalidade
- **fix:** Correção de bug
- **docs:** Documentação
- **style:** Formatação (não afeta lógica)
- **refactor:** Refatoração
- **test:** Adiciona testes
- **chore:** Tarefas de manutenção

### Exemplos

```bash
# Feature
feat(income): adiciona cálculo de Simples Nacional

Implementa cálculo de impostos para PJ no regime Simples Nacional
com alíquotas configuráveis de 4% a 33%.

Closes #42

# Fix
fix(expense): corrige validação de splits com valores decimais

Anteriormente, splits como 33.33 + 33.33 + 33.34 falhavam.
Agora aceita variação de ±0.01% para compensar arredondamentos.

# Docs
docs(readme): adiciona seção de troubleshooting

# Refactor
refactor(service): extrai cálculo de impostos para package separado
```

---

## 🎯 Criando Features

### 1. Planejamento

Antes de codificar, responda:

- **O que** vai ser implementado?
- **Por que** é necessário?
- **Como** será implementado (arquitetura)?
- Afeta **multi-tenant isolation**?
- Precisa de **cálculos financeiros**?
- Requer **migrations**?

### 2. Implementação (Backend)

#### Ordem recomendada:

1. **Model** (se necessário)
   ```go
   // mob-backend/models/nova_entidade.go
   ```

2. **Migration** (se necessário)
   ```sql
   -- mob-backend/migrations/002_add_nova_feature.sql
   CREATE TABLE nova_tabela (...);
   ```

3. **Repository**
   ```go
   // mob-backend/repositories/nova_entidade_repository.go
   ```

4. **Service**
   ```go
   // mob-backend/services/nova_entidade_service.go
   ```

5. **Controller**
   ```go
   // mob-backend/controllers/nova_entidade_controller.go
   ```

6. **Routes**
   ```go
   // Adicione em mob-backend/routes/routes.go
   ```

### 3. Implementação (Frontend)

1. **Component**
   ```jsx
   // mob-frontend/src/components/NovaFeature.jsx
   ```

2. **Integration**
   ```jsx
   // Adicione no App.jsx ou Router
   ```

### 4. Testes

```bash
# Backend (quando implementado)
cd mob-backend
go test ./services/... -v

# Frontend (quando implementado)
cd mob-frontend
npm test
```

### 5. Documentação

- Atualize `README.md` se necessário
- Adicione exemplos em `API_EXAMPLES.md`
- Documente decisões em `ARCHITECTURE.md`

---

## 🧪 Testes

### Backend - Testes Unitários

```go
// mob-backend/services/calculation/tax_calculator_test.go
package calculation

import (
    "testing"
)

func TestCalculateINSS(t *testing.T) {
    tests := []struct {
        name           string
        grossCents     int64
        expectedCents  int64
    }{
        {
            name:          "Salário R$ 1.412,00 (primeira faixa)",
            grossCents:    141200,
            expectedCents: 10590, // 7.5%
        },
        {
            name:          "Salário R$ 5.000,00 (múltiplas faixas)",
            grossCents:    500000,
            expectedCents: 50179,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := CalculateINSS(tt.grossCents)
            if result != tt.expectedCents {
                t.Errorf("CalculateINSS(%d) = %d; esperado %d", 
                    tt.grossCents, result, tt.expectedCents)
            }
        })
    }
}
```

### Rodando Testes

```bash
# Todos os testes
go test ./... -v

# Pacote específico
go test ./services/calculation -v

# Com coverage
go test ./... -cover
```

---

## 👀 Code Review

### Checklist do Revisor

- [ ] Código segue os padrões do projeto?
- [ ] Valores monetários usam `int64` (centavos)?
- [ ] Multi-tenant isolation está garantido?
- [ ] Validações estão no service layer?
- [ ] Erros são tratados adequadamente?
- [ ] Código está comentado onde necessário?
- [ ] Migrations estão corretas (se aplicável)?
- [ ] API está RESTful?
- [ ] Documentação foi atualizada?
- [ ] Testes foram adicionados?

### Como Revisar

```bash
# Faça checkout da branch
git fetch origin
git checkout feature/nome-da-feature

# Rode os testes
docker-compose up -d
# Teste manualmente os endpoints

# Deixe comentários construtivos no PR
```

---

## ✨ Boas Práticas

### Segurança

1. **Nunca commite secrets**
   ```bash
   # .gitignore já ignora .env
   # Sempre use .env.example como template
   ```

2. **Valide inputs**
   ```go
   // ✅ Sempre valide dados do usuário
   if req.Amount <= 0 {
       return errors.New("Amount deve ser positivo")
   }
   ```

3. **Multi-tenant**
   ```go
   // ✅ SEMPRE filtre por family_id
   db.Where("family_account_id = ?", familyID).Find(&expenses)
   
   // ❌ NUNCA retorne dados sem filtrar por tenant
   db.Find(&expenses) // PERIGO! Vaza dados de outras famílias
   ```

### Performance

1. **Índices no DB**
   ```sql
   -- ✅ Sempre indexe foreign keys e campos de busca
   CREATE INDEX idx_expenses_family ON expenses(family_account_id);
   ```

2. **Batch queries**
   ```go
   // ✅ BOM: Uma query
   db.Preload("Splits").Find(&expenses)
   
   // ❌ EVITE: N+1 queries
   for _, expense := range expenses {
       db.Model(&expense).Association("Splits").Find(&expense.Splits)
   }
   ```

3. **Caching (futuro)**
   ```go
   // Para dashboard, considere cache de 5min
   ```

### Monetary Precision

```go
// ✅ SEMPRE armazene em centavos (int64)
type Income struct {
    GrossMonthlyCents int64 `json:"gross_monthly_cents"`
}

// ✅ Converta apenas na apresentação
func FormatMoney(cents int64) string {
    reais := float64(cents) / 100.0
    return fmt.Sprintf("R$ %.2f", reais)
}

// ❌ NUNCA faça contas com float64 para dinheiro
grossReais := 5000.50 // ERRADO! 5000.5 * 100 = 500049.999999
```

### Error Messages

```go
// ✅ BOM: Mensagens claras e acionáveis
return errors.New("Splits devem somar 100% (atualmente: 95%)")

// ❌ EVITE: Mensagens genéricas
return errors.New("invalid data")
```

### API Design

```bash
# ✅ RESTful correto
POST   /api/families                    # Criar família
GET    /api/families/:id                # Ver família
PUT    /api/families/:id                # Atualizar família inteira
PATCH  /api/families/:id                # Atualizar parcialmente
DELETE /api/families/:id                # Deletar família

# ✅ Recursos aninhados
POST   /api/families/:id/expenses       # Criar despesa da família
GET    /api/families/:id/expenses       # Listar despesas

# ❌ EVITE: Verbos na URL
POST   /api/families/:id/create-expense # ERRADO
GET    /api/get-families                # ERRADO
```

---

## 🔄 Fluxo de Trabalho

### 1. Sincronize com upstream

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Crie feature branch

```bash
git checkout -b feature/minha-feature
```

### 3. Desenvolva e commite

```bash
git add .
git commit -m "feat(scope): descrição"
```

### 4. Push e crie PR

```bash
git push origin feature/minha-feature
```

No GitHub:
- Crie Pull Request
- Preencha template (se houver)
- Aguarde code review
- Faça ajustes se solicitado

### 5. Após merge

```bash
git checkout main
git pull upstream main
git branch -d feature/minha-feature
```

---

## 📚 Recursos

- [Effective Go](https://go.dev/doc/effective_go)
- [GORM Documentation](https://gorm.io/docs/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [React Docs](https://react.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ Dúvidas?

Abra uma issue no GitHub com a tag `question` ou entre em contato com os mantenedores.

**Obrigado por contribuir! 🚀**
