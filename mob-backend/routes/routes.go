package routes

import (
	"github.com/gin-gonic/gin"

	"finance-backend/config"
	"finance-backend/controllers"
	"finance-backend/middleware"
	"finance-backend/repositories"
	"finance-backend/services"
)

func SetupRoutes(r *gin.Engine) {
	// Inicializar repositories
	familyRepo := repositories.NewFamilyRepository(config.DB)
	incomeRepo := repositories.NewIncomeRepository(config.DB)
	expenseRepo := repositories.NewExpenseRepository(config.DB)
	categoryRepo := repositories.NewExpenseCategoryRepository(config.DB)
	investmentRepo := repositories.NewInvestmentRepository(config.DB)
	emergencyRepo := repositories.NewEmergencyFundRepository(config.DB)
	
	// Inicializar services
	familyService := services.NewFamilyService(familyRepo)
	incomeService := services.NewIncomeService(incomeRepo, familyRepo)
	expenseService := services.NewExpenseService(expenseRepo, familyRepo, categoryRepo)
	investmentService := services.NewInvestmentService(investmentRepo)
	emergencyService := services.NewEmergencyFundService(emergencyRepo, expenseRepo, incomeRepo)
	
	// Inicializar controllers
	familyCtrl := controllers.NewFamilyController(familyService)
	incomeCtrl := controllers.NewIncomeController(incomeService)
	expenseCtrl := controllers.NewExpenseController(expenseService)
	investmentCtrl := controllers.NewInvestmentController(investmentService)
	emergencyCtrl := controllers.NewEmergencyFundController(emergencyService)
	dashboardCtrl := controllers.NewDashboardController(incomeService, expenseService, investmentService, emergencyService)
	
	// ===== ROTAS PÚBLICAS =====
	r.POST("/api/auth/register", controllers.Register)
	r.POST("/api/auth/login", controllers.Login)
	
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	
	// ===== ROTAS PROTEGIDAS =====
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	api.Use(middleware.ErrorHandler())
	{
		// ===== FAMÍLIAS =====
		families := api.Group("/families")
		{
			families.POST("", familyCtrl.CreateFamily)
			families.GET("", familyCtrl.GetMyFamilies)
			
			// Rotas com tenant (verificação de acesso à família)
			family := families.Group("/:familyId")
			family.Use(middleware.TenantMiddleware(familyRepo))
			{
				family.GET("", familyCtrl.GetFamily)
				family.PUT("", familyCtrl.UpdateFamily)
				family.DELETE("", familyCtrl.DeleteFamily)
				
				// Membros
				family.GET("/members", familyCtrl.GetMembers)
				family.POST("/members", familyCtrl.AddMember)
				family.PUT("/members/:memberId", familyCtrl.UpdateMember)
				family.DELETE("/members/:memberId", familyCtrl.RemoveMember)
				
				// ===== RENDAS =====
				family.POST("/incomes", incomeCtrl.CreateIncome)
				family.GET("/incomes", incomeCtrl.GetFamilyIncomes)
				family.GET("/incomes/summary", incomeCtrl.GetFamilyIncomeSummary)
				family.GET("/incomes/:incomeId", incomeCtrl.GetIncome)
				family.GET("/incomes/:incomeId/breakdown", incomeCtrl.GetIncomeBreakdown)
				family.PUT("/incomes/:incomeId", incomeCtrl.UpdateIncome)
				family.DELETE("/incomes/:incomeId", incomeCtrl.DeleteIncome)
				
				// ===== DESPESAS =====
				family.GET("/categories", expenseCtrl.GetCategories)
				family.POST("/expenses", expenseCtrl.CreateExpense)
				family.GET("/expenses", expenseCtrl.GetFamilyExpenses)
				family.GET("/expenses/summary", expenseCtrl.GetExpensesSummary)
				family.GET("/expenses/by-category", expenseCtrl.GetExpensesByCategory)
				family.GET("/expenses/:expenseId", expenseCtrl.GetExpense)
				family.PUT("/expenses/:expenseId", expenseCtrl.UpdateExpense)
				family.DELETE("/expenses/:expenseId", expenseCtrl.DeleteExpense)
				
				// ===== INVESTIMENTOS =====
				family.POST("/investments", investmentCtrl.CreateInvestment)
				family.GET("/investments", investmentCtrl.GetFamilyInvestments)
				family.GET("/investments/summary", investmentCtrl.GetInvestmentsSummary)
				family.GET("/investments/projection", investmentCtrl.GetFamilyInvestmentsProjection)
				family.GET("/investments/:investmentId", investmentCtrl.GetInvestment)
				family.GET("/investments/:investmentId/projection", investmentCtrl.GetInvestmentProjection)
				family.PUT("/investments/:investmentId", investmentCtrl.UpdateInvestment)
				family.DELETE("/investments/:investmentId", investmentCtrl.DeleteInvestment)
				
				// ===== RESERVA DE EMERGÊNCIA =====
				family.POST("/emergency-fund", emergencyCtrl.CreateOrUpdateEmergencyFund)
				family.GET("/emergency-fund", emergencyCtrl.GetEmergencyFund)
				family.GET("/emergency-fund/progress", emergencyCtrl.GetEmergencyFundProgress)
				family.GET("/emergency-fund/suggest", emergencyCtrl.SuggestMonthlyGoal)
				family.GET("/emergency-fund/projection", emergencyCtrl.GetEmergencyFundProjection)
				family.PUT("/emergency-fund/amount", emergencyCtrl.UpdateCurrentAmount)
				family.DELETE("/emergency-fund", emergencyCtrl.DeleteEmergencyFund)
				
				// ===== DASHBOARD =====
				family.GET("/dashboard", dashboardCtrl.GetDashboard)
				family.GET("/financial-health", dashboardCtrl.GetFinancialHealth)
			}
		}
	}
	
	// ===== ROTAS LEGADAS (manter compatibilidade) =====
	auth := r.Group("/")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.POST("/renda", controllers.DefinirRenda)
		auth.POST("/gasto", controllers.AdicionarGasto)
		auth.GET("/gastos/:mesAno", controllers.ListarGastos)
		auth.GET("/resumo/:mesAno", controllers.ResumoMes)
		auth.GET("/investimentos", controllers.InvestimentosPorMes)
		auth.GET("/gastos-anuais/:ano", controllers.GastosAnuais)
		auth.DELETE("/gasto/:mesAno/:index", controllers.RemoverGasto)
	}
}
