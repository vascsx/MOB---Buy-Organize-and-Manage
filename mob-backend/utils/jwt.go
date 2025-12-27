package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret []byte

func init() {
	// Lê JWT_SECRET do ambiente
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Valor padrão apenas para desenvolvimento
		secret = "your-secret-key-change-in-production-min-32-chars"
	}
	JwtSecret = []byte(secret)
}

// GenerateToken gera um token JWT para o usuário
func GenerateToken(userID uint) (string, error) {
	// Lê tempo de expiração do ambiente (padrão: 72 horas)
	expirationHours := 72
	if envHours := os.Getenv("JWT_EXPIRATION_HOURS"); envHours != "" {
		// Aqui você pode adicionar parsing se precisar
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * time.Duration(expirationHours)).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

// ValidateToken valida e retorna os claims do token
func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}
