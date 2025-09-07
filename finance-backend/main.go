package main

import (
	"net/http"
	"sync"
	"github.com/gin-gonic/gin"
)

type Gasto struct {
	Categoria string  `json:"categoria"`
	Descricao string  `json:"descricao"`
	Valor     float64 `json:"valor"`
}

type MesData struct {
	Renda  float64 `json:"renda"`
	Gastos []Gasto `json:"gastos"`
}

var (
	dados = make(map[string]*MesData)
	mutex = &sync.Mutex{}
)

func main() {
	r := gin.Default()
	r.Use(corsMiddleware())

	r.POST("/renda", definirRenda)
	r.POST("/gasto", adicionarGasto)
	r.GET("/gastos/:mesAno", listarGastos)
	r.GET("/resumo/:mesAno", resumoMes)

	r.Run(":8080")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
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

	mutex.Lock()
	defer mutex.Unlock()
	if _, ok := dados[body.MesAno]; !ok {
		dados[body.MesAno] = &MesData{}
	}
	dados[body.MesAno].Renda = body.Renda
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

	mutex.Lock()
	defer mutex.Unlock()
	if _, ok := dados[body.MesAno]; !ok {
		dados[body.MesAno] = &MesData{}
	}
	dados[body.MesAno].Gastos = append(dados[body.MesAno].Gastos, Gasto{
		Categoria: body.Categoria,
		Descricao: body.Descricao,
		Valor:     body.Valor,
	})

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func listarGastos(c *gin.Context) {
	mesAno := c.Param("mesAno")

	mutex.Lock()
	defer mutex.Unlock()

	if data, ok := dados[mesAno]; ok {
		c.JSON(http.StatusOK, data.Gastos)
	} else {
		c.JSON(http.StatusOK, []Gasto{})
	}
}

func resumoMes(c *gin.Context) {
	mesAno := c.Param("mesAno")

	mutex.Lock()
	defer mutex.Unlock()

	if data, ok := dados[mesAno]; ok {
		totais := map[string]float64{
			"Custo Fixo":     0,
			"Custo Variável": 0,
			"Reserva":        0,
			"Investimento":   0,
		}
		for _, g := range data.Gastos {
			totais[g.Categoria] += g.Valor
		}
		saldo := data.Renda
		for _, v := range totais {
			saldo -= v
		}

		c.JSON(http.StatusOK, gin.H{
			"renda":  data.Renda,
			"totais": totais,
			"saldo":  saldo,
			"gastos": data.Gastos,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"renda":  0,
			"totais": map[string]float64{},
			"saldo":  0,
			"gastos": []Gasto{},
		})
	}
}
