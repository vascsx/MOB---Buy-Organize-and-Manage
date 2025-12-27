# Arquitetura do Sistema MOB Finance

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                      http://localhost:5173                       │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ AuthForm │  │Dashboard │  │ Expenses │  │  Charts  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└────────────────────────────┬────────────────────────────────────┘
                              │ HTTP/REST API
                              │ JWT Bearer Token
┌─────────────────────────────┴────────────────────────────────────┐
│                    BACKEND (Go + Gin)                             │
│                  http://localhost:8080                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      ROUTES LAYER                           │  │
│  │  /api/families, /api/incomes, /api/expenses, etc.         │  │
│  └──────────┬───────────────────────────────────┬─────────────┘  │
│             │                                    │                │
│  ┌──────────┴────────────┐        ┌─────────────┴──────────────┐ │
│  │  AUTH MIDDLEWARE      │        │  TENANT MIDDLEWARE         │ │
│  │  - Valida JWT         │        │  - Verifica acesso família │ │
│  │  - Extrai user_id     │        │  - Isolamento multi-tenant │ │
│  └──────────┬────────────┘        └─────────────┬──────────────┘ │
│             │                                    │                │
│  ┌──────────┴────────────────────────────────────┴──────────────┐ │
│  │                   CONTROLLERS LAYER                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │  Family  │  │  Income  │  │ Expense  │  │Dashboard │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │ │
│  │  ┌──────────┐  ┌──────────┐                                 │ │
│  │  │Investment│  │Emergency │                                 │ │
│  │  └──────────┘  └──────────┘                                 │ │
│  └──────────┬───────────────────────────────────────────────────┘ │
│             │                                                     │
│  ┌──────────┴────────────────────────────────────────────────┐   │
│  │                    SERVICES LAYER                          │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  Business Logic + Validations                        │  │   │
│  │  │  - income_service: CalculateNetIncome               │  │   │
│  │  │  - expense_service: ValidateSplits (100%)           │  │   │
│  │  │  - investment_service: GetProjections               │  │   │
│  │  │  - emergency_fund_service: SuggestMonthlyGoal       │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └──────────┬───────────────────────────┬─────────────────────┘   │
│             │                            │                         │
│  ┌──────────┴──────────┐    ┌───────────┴──────────────────────┐ │
│  │  REPOSITORIES       │    │  CALCULATION PACKAGE             │ │
│  │  - GORM queries     │    │  ┌────────────────────────────┐ │ │
│  │  - Tenant filtering │    │  │ tax_calculator.go          │ │ │
│  │  - Aggregate funcs  │    │  │ - INSS (7.5%-14%)         │ │ │
│  │  - UserHasAccess    │    │  │ - IRPF (0%-27.5%)         │ │ │
│  └──────────┬──────────┘    │  │ - FGTS (8%)               │ │ │
│             │                │  │ - Simples Nacional        │ │ │
│             │                │  └────────────────────────────┘ │ │
│             │                │  ┌────────────────────────────┐ │ │
│             │                │  │ projection_calculator.go   │ │ │
│             │                │  │ - Juros compostos mensais  │ │ │
│             │                │  │ - Multi-investment agg     │ │ │
│             │                │  └────────────────────────────┘ │ │
│             │                │  ┌────────────────────────────┐ │ │
│             │                │  │ emergency_calculator.go    │ │ │
│             │                │  │ - Target calculation       │ │ │
│             │                │  │ - Monthly goal suggestion  │ │ │
│             │                │  └────────────────────────────┘ │ │
│             │                └──────────────────────────────────┘ │
│  ┌──────────┴──────────────────────────────────────────────────┐ │
│  │                    UTILS PACKAGE                             │ │
│  │  - money.go: CentsToFloat, FloatToCents, FormatMoney        │ │
│  │  - validator.go: ValidateExpenseSplits, ValidateEmail       │ │
│  │  - response.go: SuccessResponse, ErrorResponse              │ │
│  │  - jwt.go: GenerateToken, ValidateToken                     │ │
│  └──────────┬───────────────────────────────────────────────────┘ │
└─────────────┴───────────────────────────────────────────────────┘
              │
              │ DSN: host=postgres user=mobuser...
              │
┌─────────────┴───────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL 15)                       │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  users         │  │family_accounts │  │family_members  │    │
│  │  - id          │  │  - id          │  │  - id          │    │
│  │  - email       │  │  - name        │  │  - name        │    │
│  │  - password    │  │  - owner_id FK │  │  - family_id FK│    │
│  │  - name        │  │                │  │  - user_id FK  │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  incomes       │  │  expenses      │  │expense_splits  │    │
│  │  - gross_cents │  │  - amount_cents│  │  - percentage  │    │
│  │  - net_cents   │  │  - frequency   │  │  - amount_cents│    │
│  │  - inss_cents  │  │  - category_id │  │  - member_id FK│    │
│  │  - irpf_cents  │  │  - family_id FK│  │  - expense_id FK│   │
│  │  - member_id FK│  │                │  │                │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  investments   │  │emergency_funds │  │expense_categories│   │
│  │  - balance_cents│ │  - target_cents│  │  - name        │    │
│  │  - contrib_cents│ │  - current_cents│ │  - icon        │    │
│  │  - return_rate │  │  - target_months│ │  - color       │    │
│  │  - type        │  │  - family_id FK│  │                │    │
│  │  - family_id FK│  │  (one per fam) │  │                │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Autenticação
```
User → POST /register
     → auth_controller.Register()
     → Bcrypt password
     → Save to DB
     → Generate JWT token
     → Return token + user

User → POST /login
     → auth_controller.Login()
     → Verify password
     → Generate JWT token
     → Return token
```

### 2. Criação de Renda (CLT)
```
Client → POST /api/families/:id/incomes
       → [AuthMiddleware] Valida JWT
       → [TenantMiddleware] Verifica acesso à família
       → income_controller.CreateIncome()
       → income_service.CreateIncome()
       → income_service.CalculateNetIncome()
       │   ├─→ tax_calculator.CalculateCLTNet()
       │   │   ├─→ CalculateINSS() → 7.5%-14% progressive
       │   │   ├─→ CalculateIRPF() → 0%-27.5% progressive
       │   │   └─→ CalculateFGTS() → 8% fixed
       │   └─→ Retorna net_cents, inss_cents, irpf_cents, fgts_cents
       → income_repository.Create()
       → GORM INSERT INTO incomes (gross_cents, net_cents, ...)
       → Return income with all tax fields
```

### 3. Criação de Despesa com Splits
```
Client → POST /api/families/:id/expenses
       → [Middlewares]
       → expense_controller.CreateExpense()
       → expense_service.CreateExpense()
       → validator.ValidateExpenseSplits(splits)
       │   └─→ Verifica se soma == 100% (±0.01% tolerância)
       → expense_repository.Create()
       │   └─→ DB transaction:
       │       ├─→ INSERT INTO expenses
       │       └─→ INSERT INTO expense_splits (para cada membro)
       → Return expense with splits
```

### 4. Projeção de Investimento
```
Client → GET /api/families/:id/investments/:investId/projection?years=5
       → [Middlewares]
       → investment_controller.GetInvestmentProjection()
       → investment_service.GetInvestmentProjection(investmentID, years)
       → investment_repository.GetByID(investmentID)
       → projection_calculator.CalculateInvestmentProjection()
       │   └─→ Para cada mês (0 a years*12):
       │       ├─→ balance = balance * (1 + monthlyRate) + contribution
       │       └─→ Add ProjectionPoint{month, balance, totalInvested}
       → Return array of 60 points (5 years * 12 months)
```

### 5. Dashboard Consolidado
```
Client → GET /api/families/:id/dashboard
       → [Middlewares]
       → dashboard_controller.GetDashboard()
       → Paralleliza queries:
       │   ├─→ income_service.GetFamilyIncomeSummary()
       │   ├─→ expense_service.GetFamilyExpensesSummary()
       │   ├─→ investment_service.GetInvestmentsSummary()
       │   └─→ emergency_fund_service.GetEmergencyFund()
       → Calcula:
       │   ├─→ available_balance = income - expenses
       │   ├─→ financial_health_score = CalculateScore()
       │   │   ├─→ expense_ratio_score (30pts)
       │   │   ├─→ investment_score (25pts)
       │   │   ├─→ emergency_fund_score (25pts)
       │   │   └─→ positive_balance_score (20pts)
       │   └─→ emergency_fund_progress = current / target * 100
       → Return consolidated dashboard
```

## Segurança - Multi-Tenant Isolation

### Tenant Middleware Flow
```
Request → TenantMiddleware
        → Extrai familyId do path param (:familyId)
        → Extrai userID do JWT (context["user_id"])
        → family_repository.UserHasAccess(familyId, userID)
        │   └─→ SELECT 1 FROM family_accounts
        │       WHERE id = ? AND owner_user_id = ?
        │       OR id IN (SELECT family_account_id
        │                 FROM family_members
        │                 WHERE user_id = ? AND is_active = true)
        → Se não encontrar: HTTP 403 Forbidden
        → Se encontrar: c.Set("family_id", familyId) e c.Next()
```

### Query Filtering
Todos os repositories automaticamente filtram por `family_account_id`:

```go
// Example: Get expenses
DB.Where("family_account_id = ?", familyID).Find(&expenses)

// Example: Get incomes
DB.Joins("JOIN family_members ON incomes.family_member_id = family_members.id").
   Where("family_members.family_account_id = ?", familyID).
   Find(&incomes)
```

## Cálculos Financeiros

### Impostos CLT (2025)
```
Salário Bruto: R$ 5.000,00

1. INSS (progressivo):
   Faixa 1: R$ 1.412,00 × 7.5%  = R$ 105,90
   Faixa 2: R$ 1.500,00 × 9%    = R$ 135,00
   Faixa 3: R$ 1.571,29 × 12%   = R$ 188,55
   Faixa 4: R$ 516,71   × 14%   = R$ 72,34
   INSS Total = R$ 501,79

2. IRPF (sobre salário - INSS):
   Base = R$ 5.000,00 - R$ 501,79 = R$ 4.498,21
   
   Faixa: R$ 2.259,21 a R$ 2.826,65 → Alíquota 7.5%
   IRPF = (R$ 4.498,21 - R$ 2.259,20) × 7.5% = R$ 167,93
   IRPF com dedução = R$ 167,93 - R$ 169,44 = R$ 0,00 (isento)

3. FGTS (não deduz do salário, mas é custo da empresa):
   FGTS = R$ 5.000,00 × 8% = R$ 400,00

Salário Líquido = R$ 5.000,00 - R$ 501,79 - R$ 0,00 = R$ 4.498,21
```

### Projeção de Investimento
```
Investimento Inicial: R$ 5.000,00
Aporte Mensal: R$ 500,00
Taxa Anual: 12% → Taxa Mensal = (1.12)^(1/12) - 1 = 0.9489% ao mês
Período: 60 meses (5 anos)

Mês 0:  Balance = R$ 5.000,00
Mês 1:  Balance = R$ 5.000,00 × 1.009489 + R$ 500,00 = R$ 5.547,44
Mês 2:  Balance = R$ 5.547,44 × 1.009489 + R$ 500,00 = R$ 6.100,07
...
Mês 60: Balance = R$ 49.003,39

Total Investido: R$ 5.000,00 + (R$ 500,00 × 60) = R$ 35.000,00
Ganho: R$ 49.003,39 - R$ 35.000,00 = R$ 14.003,39
```

### Reserva de Emergência
```
Despesas Mensais: R$ 4.000,00
Meta: 6 meses
Target Amount = R$ 4.000,00 × 6 = R$ 24.000,00

Current Amount: R$ 5.000,00
Progress: R$ 5.000,00 / R$ 24.000,00 = 20,83%

Renda Disponível: R$ 10.000,00 - R$ 4.000,00 = R$ 6.000,00
Sugestão de Aporte Mensal: R$ 6.000,00 × 30% = R$ 1.800,00

Tempo para Meta:
(R$ 24.000,00 - R$ 5.000,00) / R$ 1.800,00 = 10,56 meses
```

## Stack Técnica Detalhada

### Backend
- **Linguagem:** Go 1.21+
- **Framework Web:** Gin (routing, middleware)
- **ORM:** GORM v2
- **Auth:** JWT com golang-jwt/jwt/v5
- **Passwords:** bcrypt
- **Validação:** Custom validators + business rules
- **Logging:** log padrão do Go
- **Precision:** int64 para valores monetários (centavos)

### Database
- **RDBMS:** PostgreSQL 15
- **Features usados:**
  - Foreign keys com CASCADE
  - CHECK constraints
  - Unique constraints
  - Indexes compostos
  - JSONB (futuro: extensibilidade)
  - Triggers (futuro: auditoria)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Charts:** Recharts
- **HTTP:** Fetch API
- **State:** Context API + useState

### DevOps
- **Containerização:** Docker + Docker Compose
- **Health Checks:** HTTP endpoint /health
- **Env Vars:** .env file
- **Logs:** docker-compose logs

## Padrões Arquiteturais

1. **Layered Architecture:**
   - Routes → Controllers → Services → Repositories → Database
   - Separation of concerns
   - Testable components

2. **Repository Pattern:**
   - Abstração de acesso a dados
   - Isolamento de GORM
   - Queries reutilizáveis

3. **Service Layer:**
   - Business logic centralizada
   - Validações complexas
   - Orquestração de repositories

4. **Middleware Chain:**
   - Auth → Tenant → Error Handler
   - Request preprocessing
   - Response normalization

5. **Multi-Tenant SaaS:**
   - Family-based isolation
   - Row-level security
   - Access control middleware

## Princípios Seguidos

- **SOLID:** Single Responsibility, Dependency Injection
- **DRY:** Utilities reutilizáveis (money, validators)
- **KISS:** Código simples e legível
- **Fail Fast:** Validações early, erros claros
- **Monetary Precision:** int64 sempre, nunca float64
- **API RESTful:** Recursos claros, verbos HTTP corretos
- **Stateless:** JWT sem sessão no servidor
- **Idempotência:** PUT/DELETE idempotentes
