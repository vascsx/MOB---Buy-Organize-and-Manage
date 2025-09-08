package routes

import (
	"github.com/gin-gonic/gin"

	"finance-backend/controllers"
	"finance-backend/middleware"
)

func SetupRoutes(r *gin.Engine) {
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

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
