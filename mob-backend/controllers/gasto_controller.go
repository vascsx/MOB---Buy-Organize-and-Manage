package controllers

import (
	"finance-backend/config"
	"finance-backend/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Retorna o total de gastos por mês para o ano informado
func GastosAnuais(c *gin.Context) {
	userID := c.GetUint("user_id")
	ano := c.Param("ano")
	totais := make([]float64, 12)
	var meses []models.MesData
	if err := config.DB.Preload("Gastos").Where("user_id = ? AND mes_ano LIKE ?", userID, "%-"+ano).Find(&meses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for _, mes := range meses {
		// mes.MesAno no formato MM-YYYY
		partes := []rune(mes.MesAno)
		if len(partes) < 7 {
			continue
		}
		mesNum, err := strconv.Atoi(string(partes[0:2]))
		if err != nil || mesNum < 1 || mesNum > 12 {
			continue
		}
		total := 0.0
		for _, g := range mes.Gastos {
			total += g.Valor
		}
		totais[mesNum-1] = total
	}
	c.JSON(http.StatusOK, gin.H{"totais": totais})
}

func AdicionarGasto(c *gin.Context) {
	userID := c.GetUint("user_id")
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

	var mes models.MesData
	if err := config.DB.Where("mes_ano = ? AND user_id = ?", body.MesAno, userID).First(&mes).Error; err != nil {
		mes = models.MesData{MesAno: body.MesAno, UserID: userID}
		config.DB.Create(&mes)
	}

	gasto := models.Gasto{
		Categoria: body.Categoria,
		Descricao: body.Descricao,
		Valor:     body.Valor,
		MesDataID: mes.ID,
	}
	config.DB.Create(&gasto)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func ListarGastos(c *gin.Context) {
	userID := c.GetUint("user_id")
	mesAno := c.Param("mesAno")

	var mes models.MesData
	if err := config.DB.Preload("Gastos").Where("mes_ano = ? AND user_id = ?", mesAno, userID).First(&mes).Error; err != nil {
		c.JSON(http.StatusOK, []models.Gasto{})
		return
	}

	c.JSON(http.StatusOK, mes.Gastos)
}

func RemoverGasto(c *gin.Context) {
	userID := c.GetUint("user_id")
	mesAno := c.Param("mesAno")
	indexStr := c.Param("index")

	var index int
	if _, err := fmt.Sscanf(indexStr, "%d", &index); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Índice inválido"})
		return
	}

	var mes models.MesData
	if err := config.DB.Preload("Gastos").Where("mes_ano = ? AND user_id = ?", mesAno, userID).First(&mes).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mês não encontrado"})
		return
	}

	if index < 0 || index >= len(mes.Gastos) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Índice fora do intervalo"})
		return
	}

	gasto := mes.Gastos[index]
	config.DB.Delete(&gasto)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
