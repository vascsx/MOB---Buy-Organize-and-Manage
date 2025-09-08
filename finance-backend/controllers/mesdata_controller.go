package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"finance-backend/config"
	"finance-backend/models"
)

func DefinirRenda(c *gin.Context) {
	userID := c.GetUint("user_id")
	var body struct {
		MesAno string  `json:"mesAno"`
		Renda  float64 `json:"renda"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var mes models.MesData
	if err := config.DB.Where("mes_ano = ? AND user_id = ?", body.MesAno, userID).First(&mes).Error; err != nil {
		mes = models.MesData{MesAno: body.MesAno, Renda: body.Renda, UserID: userID}
		config.DB.Create(&mes)
	} else {
		config.DB.Model(&mes).Update("Renda", body.Renda)
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func ResumoMes(c *gin.Context) {
	userID := c.GetUint("user_id")
	mesAno := c.Param("mesAno")

	var mes models.MesData
	if err := config.DB.Preload("Gastos").Where("mes_ano = ? AND user_id = ?", mesAno, userID).First(&mes).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"renda":  0,
			"totais": map[string]float64{},
			"saldo":  0,
			"gastos": []models.Gasto{},
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
