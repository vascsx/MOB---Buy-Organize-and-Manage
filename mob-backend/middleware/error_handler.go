package middleware

import (
	"finance-backend/utils"
	"github.com/gin-gonic/gin"
)

// ErrorHandler middleware para capturar panics e erros não tratados
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log do erro (pode adicionar logger depois)
				// log.Printf("Panic recovered: %v", err)
				
				utils.InternalErrorResponse(c, "Erro interno do servidor")
				c.Abort()
			}
		}()
		
		c.Next()
		
		// Verificar se houve erro no processamento
		if len(c.Errors) > 0 {
			// Retornar primeiro erro
			err := c.Errors[0]
			utils.ErrorResponse(c, 500, err.Error())
		}
	}
}
