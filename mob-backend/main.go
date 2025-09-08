package main

import (
	"github.com/gin-gonic/gin"

	"finance-backend/config"
	"finance-backend/routes"
)

func main() {
	config.InitDB()

	r := gin.Default()
	r.Use(corsMiddleware())

	routes.SetupRoutes(r)

	r.Run(":8080")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	}
}
