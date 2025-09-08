package main

import (
	"log"
	"net/http"
	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Gasto struct {
	ID        uint    `gorm:"primaryKey"`
	Categoria string  `json:"categoria"`
	Descricao string  `json:"descricao"`
	Valor     float64 `json:"valor"`
	MesDataID uint
}

type MesData struct {
	ID     uint    `gorm:"primaryKey"`
	MesAno string  `gorm:"uniqueIndex"`
	Renda  float64 `json:"renda"`
	Gastos []Gasto `gorm:"foreignKey:MesDataID"`
}

var db *gorm.DB

func initDB() {
	dsn := "host=localhost user=financeuser password=financepass dbname=finance port=5432 sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Falha ao conectar no banco:", err)
	}

	db.AutoMigrate(&MesData{}, &Gasto{})
}

func main() {
	initDB()

	r := gin.Default()
	r.Use(corsMiddleware())


	r.POST("/renda", definirRenda)
	r.POST("/gasto", adicionarGasto)
	r.GET("/gastos/:mesAno", listarGastos)
	r.GET("/resumo/:mesAno", resumoMes)
	r.DELETE("/gasto/:mesAno/:index", removerGasto)
	r.PUT("/gasto/:mesAno/:index", editarGasto)


	r.Run(":8080")
}

func corsMiddleware() gin.HandlerFunc {
       return func(c *gin.Context) {
	       c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	       c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	       c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type")
	       if c.Request.Method == "OPTIONS" {
		       c.AbortWithStatus(200)
		       return
	       }
	       c.Next()
       }
}

func definirRenda(c *gin.Context) {
	var body struct {
		MesAno string  `json:"mesAno"`
		Renda  float64 `json:"renda"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var mes MesData
	if err := db.Where("mes_ano = ?", body.MesAno).First(&mes).Error; err != nil {
		mes = MesData{MesAno: body.MesAno, Renda: body.Renda}
		db.Create(&mes)
	} else {
		db.Model(&mes).Update("Renda", body.Renda)
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func adicionarGasto(c *gin.Context) {
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
	if err := db.Where("mes_ano = ?", body.MesAno).First(&mes).Error; err != nil {
		mes = MesData{MesAno: body.MesAno}
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

// Edita um gasto existente pelo índice na lista de gastos do mês
func editarGasto(c *gin.Context) {
       mesAno := c.Param("mesAno")
       indexStr := c.Param("index")
       var index int
       if _, err := fmt.Sscanf(indexStr, "%d", &index); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "Índice inválido"})
	       return
       }

       var body struct {
	       Categoria string  `json:"categoria"`
	       Descricao string  `json:"descricao"`
	       Valor     float64 `json:"valor"`
       }
       if err := c.ShouldBindJSON(&body); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	       return
       }

       var mes MesData
       if err := db.Preload("Gastos").Where("mes_ano = ?", mesAno).First(&mes).Error; err != nil {
	       c.JSON(http.StatusNotFound, gin.H{"error": "Mês não encontrado"})
	       return
       }
       if index < 0 || index >= len(mes.Gastos) {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "Índice fora do intervalo"})
	       return
       }
       gasto := &mes.Gastos[index]
       gasto.Categoria = body.Categoria
       gasto.Descricao = body.Descricao
       gasto.Valor = body.Valor
       db.Save(gasto)
       c.JSON(http.StatusOK, gin.H{"status": "ok"})
}


func removerGasto(c *gin.Context) {
       mesAno := c.Param("mesAno")
       indexStr := c.Param("index")
       var index int
       if _, err := fmt.Sscanf(indexStr, "%d", &index); err != nil {
	       c.JSON(http.StatusBadRequest, gin.H{"error": "Índice inválido"})
	       return
       }

       var mes MesData
       if err := db.Preload("Gastos").Where("mes_ano = ?", mesAno).First(&mes).Error; err != nil {
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

func listarGastos(c *gin.Context) {
	mesAno := c.Param("mesAno")
	var mes MesData
	if err := db.Preload("Gastos").Where("mes_ano = ?", mesAno).First(&mes).Error; err != nil {
		c.JSON(http.StatusOK, []Gasto{})
		return
	}
	c.JSON(http.StatusOK, mes.Gastos)
}

func resumoMes(c *gin.Context) {
	mesAno := c.Param("mesAno")
	var mes MesData
	if err := db.Preload("Gastos").Where("mes_ano = ?", mesAno).First(&mes).Error; err != nil {
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
