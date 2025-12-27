# MOB - Organizador Financeiro Familiar

Sistema SaaS para gestão financeira de casais e famílias, com suporte para diferentes tipos de renda (CLT e PJ), cálculo automático de impostos, divisão de despesas, projeções de investimentos e reserva de emergência.

## 🚀 Tecnologias

**Backend:**
- Go 1.21+ com Gin Framework
- PostgreSQL 15
- GORM (ORM)
- JWT Authentication

**Frontend:**
- React + Vite
- Recharts (gráficos)
- React Router DOM

**DevOps:**
- Docker & Docker Compose
- Health checks configurados

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Git
- (Opcional) Go 1.21+ e Node.js 18+ para desenvolvimento local

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd MOB---Buy-Organize-and-Manage
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

**IMPORTANTE:** Edite o arquivo `.env` e altere `JWT_SECRET` para um valor seguro:

```bash
# Gere um segredo forte (Linux/Mac)
openssl rand -base64 32

# Ou use qualquer string com mínimo 32 caracteres
```

Edite `.env`:
```bash
JWT_SECRET=seu-segredo-forte-gerado-aqui
```

### 3. Inicie os containers

```bash
docker-compose up -d
```

Isso irá:
- ✅ Criar banco PostgreSQL (porta 5432)
- ✅ Construir e iniciar backend Go (porta 8080)
- ✅ Construir e iniciar frontend React (porta 5173)

### 4. Verifique o status

```bash
# Ver logs
docker-compose logs -f

# Verificar health check
curl http://localhost:8080/health
```

## 📡 API Endpoints

Base URL: `http://localhost:8080/api`

### Autenticação
- `POST /register` - Registrar novo usuário
- `POST /login` - Login (retorna JWT token)

### Famílias
- `POST /api/families` - Criar família
- `GET /api/families/:familyId` - Detalhes da família
- `GET /api/families` - Minhas famílias
- `GET /api/families/:familyId/dashboard` - Dashboard consolidado
- `GET /api/families/:familyId/financial-health` - Score de saúde financeira

### Membros
- `POST /api/families/:familyId/members` - Adicionar membro
- `GET /api/families/:familyId/members` - Listar membros
- `PUT /api/families/:familyId/members/:memberId` - Atualizar membro
- `DELETE /api/families/:familyId/members/:memberId` - Remover membro

### Renda
- `POST /api/families/:familyId/incomes` - Criar renda (CLT/PJ)
  - Calcula automaticamente: INSS, IRPF, FGTS, Simples Nacional
- `GET /api/families/:familyId/incomes` - Listar rendas
- `GET /api/families/:familyId/incomes/summary` - Resumo consolidado
- `GET /api/families/:familyId/incomes/:incomeId/breakdown` - Detalhamento de impostos

### Despesas
- `POST /api/families/:familyId/expenses` - Criar despesa com splits
- `GET /api/families/:familyId/expenses` - Listar despesas
- `GET /api/families/:familyId/expenses/by-category` - Agrupar por categoria
- `GET /api/families/:familyId/expenses/summary` - Resumo de gastos

### Investimentos
- `POST /api/families/:familyId/investments` - Criar investimento
- `GET /api/families/:familyId/investments` - Listar investimentos
- `GET /api/families/:familyId/investments/summary` - Resumo por tipo
- `GET /api/families/:familyId/investments/projection?years=5` - Projeção de crescimento

### Reserva de Emergência
- `POST /api/families/:familyId/emergency-fund` - Criar/atualizar reserva
- `GET /api/families/:familyId/emergency-fund` - Detalhes da reserva
- `GET /api/families/:familyId/emergency-fund/progress` - Progresso detalhado
- `GET /api/families/:familyId/emergency-fund/suggest-goal` - Sugestão de meta mensal
- `GET /api/families/:familyId/emergency-fund/projection` - Projeção de alcance da meta

## 💰 Funcionalidades

### Cálculo de Impostos Brasileiros (2025)
- **CLT:** INSS progressivo (7.5%-14%), IRPF (até 27.5%), FGTS (8%)
- **PJ:** Simples Nacional (configurável por faixa)

### Divisão de Despesas
- Porcentagem customizável por membro
- Validação (splits devem somar 100%)
- Suporte a frequências: única, mensal, anual

### Projeções de Investimentos
- Juros compostos mensais
- Projeções para 1, 3, 5 anos
- Consolidação de múltiplos investimentos

### Reserva de Emergência
- Meta: 6-12 meses de despesas
- Sugestão automática de aporte mensal (máx 30% da renda disponível)
- Projeção de tempo para atingir meta

### Dashboard Consolidado
- Renda total líquida
- Despesas totais
- Saldo disponível
- Total investido
- Reserva de emergência

### Score de Saúde Financeira (0-100)
- **30 pontos:** Proporção despesas/renda (<50% = 30pts)
- **25 pontos:** Investimentos (>20% da renda = 25pts)
- **25 pontos:** Reserva de emergência (6+ meses = 25pts)
- **20 pontos:** Saldo positivo

## 🗂️ Estrutura do Projeto

```
mob-backend/
├── config/          # Configuração do banco
├── controllers/     # Handlers HTTP
├── middleware/      # Auth, Tenant, Error handling
├── models/          # Entities do domínio
├── repositories/    # Data access layer
├── services/        # Business logic
│   └── calculation/ # Tax, projection, emergency calculators
├── routes/          # Definição de endpoints
├── utils/           # Helpers (JWT, money, validators)
└── migrations/      # SQL schemas

mob-frontend/
├── src/
│   ├── components/  # React components
│   ├── App.jsx      # Main app
│   └── main.jsx     # Entry point
└── vite.config.js
```

## 🔒 Segurança

### Multi-Tenant Isolation
- Cada família é um tenant isolado
- Middleware valida acesso em todas as rotas
- Queries automáticas com `family_id`

### Authentication
- JWT com expiração configurável (padrão: 72h)
- Bearer token no header: `Authorization: Bearer <token>`

### Variáveis Sensíveis
- JWT_SECRET deve ter mínimo 32 caracteres
- Senhas do banco NÃO devem estar versionadas
- Use `.env` local (não commitar)

## 🧪 Desenvolvimento Local

### Backend (sem Docker)

```bash
cd mob-backend

# Instale dependências
go mod download

# Configure .env
export DB_HOST=localhost
export JWT_SECRET=seu-segredo-aqui

# Execute
go run main.go
```

### Frontend (sem Docker)

```bash
cd mob-frontend

# Instale dependências
npm install

# Configure API URL
echo "VITE_API_URL=http://localhost:8080/api" > .env

# Execute
npm run dev
```

## 📊 Migrations

As migrations estão em `mob-backend/migrations/001_initial_schema.sql`.

Para aplicar manualmente:

```bash
docker exec -i mob-postgres psql -U mobuser -d mob_finance < mob-backend/migrations/001_initial_schema.sql
```

Ou deixe o GORM fazer AutoMigrate (menos controle):
- Já configurado em `config/database.go`

## 🐛 Troubleshooting

### Backend não conecta ao banco
```bash
# Verifique se o postgres está rodando
docker-compose ps

# Veja logs do postgres
docker-compose logs postgres

# Teste conexão
docker exec -it mob-postgres psql -U mobuser -d mob_finance
```

### Frontend não consegue chamar API
- Verifique CORS em `main.go`
- Confirme `VITE_API_URL` em `.env`
- Veja logs do backend: `docker-compose logs backend`

### JWT inválido
- Confirme que `JWT_SECRET` é o mesmo no backend
- Token pode ter expirado (padrão 72h)
- Faça novo login para gerar token novo

## 📝 TODO

- [ ] Testes unitários (calculators)
- [ ] Testes de integração (API)
- [ ] Documentação Swagger/OpenAPI
- [ ] CI/CD pipeline
- [ ] Deploy em produção (Railway/Render)
- [ ] Backup automático do banco
- [ ] Monitoramento e métricas

## 📄 Licença

MIT

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
