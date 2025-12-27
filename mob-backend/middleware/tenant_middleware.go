package middleware

import (
	"finance-backend/repositories"
	"finance-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// TenantMiddleware garante isolamento multi-tenant
// Verifica se o usuário tem acesso à família especificada na URL
func TenantMiddleware(familyRepo *repositories.FamilyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obter user_id do contexto (definido pelo AuthMiddleware)
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			utils.UnauthorizedResponse(c, "Usuário não autenticado")
			c.Abort()
			return
		}
		
		userID, ok := userIDInterface.(uint)
		if !ok {
			utils.InternalErrorResponse(c, "ID de usuário inválido")
			c.Abort()
			return
		}
		
		// Obter family_id da URL
		familyIDParam := c.Param("familyId")
		if familyIDParam == "" {
			// Se não houver family_id na URL, deixar passar (pode ser endpoint que não requer)
			c.Next()
			return
		}
		
		familyID, err := strconv.ParseUint(familyIDParam, 10, 32)
		if err != nil {
			utils.ErrorResponse(c, 400, "ID da família inválido")
			c.Abort()
			return
		}
		
		// Verificar se usuário tem acesso à família
		hasAccess, err := familyRepo.UserHasAccess(userID, uint(familyID))
		if err != nil {
			utils.InternalErrorResponse(c, "Erro ao verificar acesso")
			c.Abort()
			return
		}
		
		if !hasAccess {
			utils.ForbiddenResponse(c, "Você não tem acesso a esta família")
			c.Abort()
			return
		}
		
		// Adicionar family_id ao contexto para uso nos controllers
		c.Set("family_id", uint(familyID))
		
		c.Next()
	}
}

// MemberTenantMiddleware verifica se um membro pertence à família do usuário
func MemberTenantMiddleware(familyRepo *repositories.FamilyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obter user_id do contexto
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			utils.UnauthorizedResponse(c, "Usuário não autenticado")
			c.Abort()
			return
		}
		
		userID, ok := userIDInterface.(uint)
		if !ok {
			utils.InternalErrorResponse(c, "ID de usuário inválido")
			c.Abort()
			return
		}
		
		// Obter member_id da URL
		memberIDParam := c.Param("memberId")
		if memberIDParam == "" {
			c.Next()
			return
		}
		
		memberID, err := strconv.ParseUint(memberIDParam, 10, 32)
		if err != nil {
			utils.ErrorResponse(c, 400, "ID do membro inválido")
			c.Abort()
			return
		}
		
		// Buscar membro e verificar se pertence a uma família do usuário
		member, err := familyRepo.GetMemberByID(uint(memberID))
		if err != nil {
			utils.NotFoundResponse(c, "Membro")
			c.Abort()
			return
		}
		
		// Verificar se usuário tem acesso à família do membro
		hasAccess, err := familyRepo.UserHasAccess(userID, member.FamilyAccountID)
		if err != nil {
			utils.InternalErrorResponse(c, "Erro ao verificar acesso")
			c.Abort()
			return
		}
		
		if !hasAccess {
			utils.ForbiddenResponse(c, "Você não tem acesso a este membro")
			c.Abort()
			return
		}
		
		// Adicionar member_id e family_id ao contexto
		c.Set("member_id", uint(memberID))
		c.Set("family_id", member.FamilyAccountID)
		
		c.Next()
	}
}

// OptionalTenantMiddleware permite acesso sem family_id (para criar nova família, etc)
func OptionalTenantMiddleware(familyRepo *repositories.FamilyRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		familyIDParam := c.Param("familyId")
		
		if familyIDParam != "" {
			// Se houver family_id, verificar acesso
			userIDInterface, exists := c.Get("user_id")
			if !exists {
				utils.UnauthorizedResponse(c, "Usuário não autenticado")
				c.Abort()
				return
			}
			
			userID, ok := userIDInterface.(uint)
			if !ok {
				utils.InternalErrorResponse(c, "ID de usuário inválido")
				c.Abort()
				return
			}
			
			familyID, err := strconv.ParseUint(familyIDParam, 10, 32)
			if err != nil {
				utils.ErrorResponse(c, 400, "ID da família inválido")
				c.Abort()
				return
			}
			
			hasAccess, err := familyRepo.UserHasAccess(userID, uint(familyID))
			if err != nil {
				utils.InternalErrorResponse(c, "Erro ao verificar acesso")
				c.Abort()
				return
			}
			
			if !hasAccess {
				utils.ForbiddenResponse(c, "Você não tem acesso a esta família")
				c.Abort()
				return
			}
			
			c.Set("family_id", uint(familyID))
		}
		
		c.Next()
	}
}
