package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// APIResponse padroniza respostas da API
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// SuccessResponse retorna resposta de sucesso
func SuccessResponse(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Data:    data,
	})
}

// SuccessWithMessage retorna resposta de sucesso com mensagem
func SuccessWithMessage(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse retorna resposta de erro
func ErrorResponse(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Message: message,
	})
}

// ValidationErrorResponse retorna resposta de erro de validação
func ValidationErrorResponse(c *gin.Context, errors ValidationErrors) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Message: "Erros de validação",
		Error:   errors,
	})
}

// NotFoundResponse retorna resposta de não encontrado
func NotFoundResponse(c *gin.Context, resource string) {
	c.JSON(http.StatusNotFound, APIResponse{
		Success: false,
		Message: resource + " não encontrado(a)",
	})
}

// UnauthorizedResponse retorna resposta de não autorizado
func UnauthorizedResponse(c *gin.Context, message string) {
	if message == "" {
		message = "Não autorizado"
	}
	c.JSON(http.StatusUnauthorized, APIResponse{
		Success: false,
		Message: message,
	})
}

// ForbiddenResponse retorna resposta de acesso negado
func ForbiddenResponse(c *gin.Context, message string) {
	if message == "" {
		message = "Acesso negado"
	}
	c.JSON(http.StatusForbidden, APIResponse{
		Success: false,
		Message: message,
	})
}

// InternalErrorResponse retorna resposta de erro interno
func InternalErrorResponse(c *gin.Context, message string) {
	if message == "" {
		message = "Erro interno do servidor"
	}
	c.JSON(http.StatusInternalServerError, APIResponse{
		Success: false,
		Message: message,
	})
}
