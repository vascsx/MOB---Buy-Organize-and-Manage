package main

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"

	"finance-backend/config"
	"finance-backend/routes"
	"finance-backend/utils/logger"
)

func main() {
	// Inicializa logger estruturado
	logger.InitLogger("mob-finance-backend")
	log := logger.GetLogger()
	
	// Inicializa banco de dados
	config.InitDB()

	// Configura modo do Gin
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug"
	}
	gin.SetMode(ginMode)

	// Cria router
	r := gin.New()
	
	// Middlewares de logging e recovery
	r.Use(logger.GinLogger())
	r.Use(logger.GinRecovery())

	// Middleware CORS
	r.Use(corsMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "mob-finance-backend",
		})
	})

	// Setup das rotas da aplicação
	routes.SetupRoutes(r)

	// Porta do servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Info("Servidor iniciado", map[string]interface{}{
		"port": port,
		"mode": ginMode,
	})
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Erro ao iniciar servidor", map[string]interface{}{
			"error": err.Error(),
		})
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lê origins permitidos do ambiente
		allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			// Padrão: desenvolvimento local apenas
			// NUNCA use "*" em produção!
			if gin.Mode() == gin.ReleaseMode {
				c.AbortWithStatusJSON(500, gin.H{"error": "CORS_ALLOWED_ORIGINS não configurado"})
				return
			}
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		} else {
			// Verifica se a origin da requisição está na lista
			origin := c.Request.Header.Get("Origin")
			origins := strings.Split(allowedOrigins, ",")
			for _, allowed := range origins {
				if strings.TrimSpace(allowed) == origin {
					c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	}
}
