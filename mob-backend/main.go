package main

import (
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"

	"finance-backend/config"
	"finance-backend/routes"
)

func main() {
	// Inicializa banco de dados
	config.InitDB()

	// Configura modo do Gin
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug"
	}
	gin.SetMode(ginMode)

	// Cria router
	r := gin.Default()

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

	log.Printf("🚀 Servidor rodando na porta %s", port)
	log.Printf("📊 Health check: http://localhost:%s/health", port)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Erro ao iniciar servidor:", err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lê origins permitidos do ambiente
		allowedOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			// Padrão: permite todas as origens (apenas para desenvolvimento)
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
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
