package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)


type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"uniqueIndex" json:"username"`
	Password string `json:"password"`
	MesDatas []MesData
}

type Gasto struct {
	ID        uint    `gorm:"primaryKey"`
	Categoria string  `json:"categoria"`
	Descricao string  `json:"descricao"`
	Valor     float64 `json:"valor"`
	MesDataID uint
}

type MesData struct {
	ID      uint    `gorm:"primaryKey"`
	MesAno  string  `gorm:"uniqueIndex:idx_user_mesano"` 
	Renda   float64 `json:"renda"`
	UserID  uint    `gorm:"uniqueIndex:idx_user_mesano"`
	Gastos  []Gasto `gorm:"foreignKey:MesDataID"`
}


var db *gorm.DB
var jwtSecret = []byte("segredo_super_secreto")

func initDB() {
	dsn := "host=localhost user=financeuser password=financepass dbname=finance port=5432 sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Falha ao conectar no banco:", err)
	}

	db.AutoMigrate(&User{}, &MesData{}, &Gasto{})
}

// -------------------- AUTH --------------------

func register(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 12)
	if err != nil {
		c.JSON(500, gin.H{"error": "Erro ao gerar hash"})
		return
	}

	user := User{Username: body.Username, Password: string(hash)}
	if err := db.Create(&user).Error; err != nil {
		c.JSON(400, gin.H{"error": "Usuário já existe"})
		return
	}
	c.JSON(200, gin.H{"status": "ok"})
}

func login(c *gin.Context) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var user User
	if err := db.Where("username = ?", body.Username).First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "Usuário ou senha inválidos"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Usuário ou senha inválidos"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(500, gin.H{"error": "Erro ao gerar token"})
		return
	}
	c.JSON(200, gin.H{"token": tokenString})
}

// -------------------- MIDDLEWARE --------------------

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if len(auth) < 8 || auth[:7] != "Bearer " {
			c.AbortWithStatusJSON(401, gin.H{"error": "Token ausente"})
			return
		}
		tokenStr := auth[7:]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "Token inválido"})
			return
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Token inválido"})
			return
		}
		idFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Token inválido"})
			return
		}
		c.Set("user_id", uint(idFloat))
		c.Next()
	}
}

// -------------------- UTIL --------------------

func getUserID(c *gin.Context) uint {
	return c.GetUint("user_id")
}

// -------------------- ENDPOINTS FINANCEIROS --------------------

func definirRenda(c *gin.Context) {
	userID := getUserID(c)
	var body struct {
		MesAno string  `json:"mesAno"`
		Renda  float64 `json:"renda"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var mes MesData
	if err := db.Where("mes_ano = ? AND user_id = ?", body.MesAno, userID).First(&mes).Error; err != nil {
		mes = MesData{MesAno: body.MesAno, Renda: body.Renda, UserID: userID}
		db.Create(&mes)
	} else {
		db.Model(&mes).Update("Renda", body.Renda)
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func adicionarGasto(c *gin.Context) {
	userID := getUserID(c)
	var body struct {
		MesAno    string  `json:"mesAno"`
		Categoria string  `json:"categoria"`
		Descricao string  `json:"descricao"`
		Valor     float64 `json:"valor"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var mes MesData
	if err := db.Where("mes_ano = ? AND user_id = ?", body.MesAno, userID).First(&mes).Error; err != nil {
		mes = MesData{MesAno: body.MesAno, UserID: userID}
		db.Create(&mes)
	}

	gasto := Gasto{
		Categoria: body.Categoria,
		Descricao: body.Descricao,
		Valor:     body.Valor,
		MesDataID: mes.ID,
	}
	db.Create(&gasto)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func listarGastos(c *gin.Context) {
	userID := getUserID(c)
	mesAno := c.Param("mesAno")
	var mes MesData
	if err := db.Preload("Gastos").Where("mes_ano = ? AND user_id = ?", mesAno, userID).First(&mes).Error; err != nil {
		c.JSON(http.StatusOK, []Gasto{})
		return
	}
	c.JSON(http.StatusOK, mes.Gastos)
}

func resumoMes(c *gin.Context) {
	userID := getUserID(c)
	mesAno := c.Param("mesAno")
	var mes MesData
	if err := db.Preload("Gastos").Where("mes_ano = ? AND user_id = ?", mesAno, userID).First(&mes).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"renda":  0,
			"totais": map[string]float64{},
			"saldo":  0,
			"gastos": []Gasto{},
		})
		return
	}

	totais := map[string]float64{
		"Custo Fixo":     0,
		"Custo Variável": 0,
		"Reserva":        0,
		"Investimento":   0,
	}

	for _, g := range mes.Gastos {
		totais[g.Categoria] += g.Valor
	}

	saldo := mes.Renda
	for _, v := range totais {
		saldo -= v
	}

	c.JSON(http.StatusOK, gin.H{
		"renda":  mes.Renda,
		"totais": totais,
		"saldo":  saldo,
		"gastos": mes.Gastos,
	})
}

// Outros endpoints (editar, remover, totais anuais) podem ser adaptados da mesma forma usando `userID`
// Exemplo para removerGasto:

func removerGasto(c *gin.Context) {
	userID := getUserID(c)
	mesAno := c.Param("mesAno")
	indexStr := c.Param("index")
	var index int
	if _, err := fmt.Sscanf(indexStr, "%d", &index); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Índice inválido"})
		return
	}

	var mes MesData
	if err := db.Preload("Gastos").Where("mes_ano = ? AND user_id = ?", mesAno, userID).First(&mes).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mês não encontrado"})
		return
	}
	if index < 0 || index >= len(mes.Gastos) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Índice fora do intervalo"})
		return
	}
	gasto := mes.Gastos[index]
	db.Delete(&gasto)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// -------------------- MAIN --------------------

func main() {
	initDB()
	r := gin.Default()
	r.Use(corsMiddleware())

	// Rotas públicas
	r.POST("/register", register)
	r.POST("/login", login)

	// Rotas protegidas
	auth := r.Group("/")
	auth.Use(AuthMiddleware())
	{
		auth.POST("/renda", definirRenda)
		auth.POST("/gasto", adicionarGasto)
		auth.GET("/gastos/:mesAno", listarGastos)
		auth.GET("/resumo/:mesAno", resumoMes)
		auth.DELETE("/gasto/:mesAno/:index", removerGasto)
		// editarGasto e totaisGastosAno seguem mesma lógica de userID
	}

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
