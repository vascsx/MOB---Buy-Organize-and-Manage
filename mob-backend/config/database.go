package config

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"finance-backend/models"
)

var DB *gorm.DB

func InitDB() {
	dsn := "host=localhost user=financeuser password=financepass dbname=finance port=5432 sslmode=disable"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro ao conectar no banco:", err)
	}

	DB.AutoMigrate(&models.User{}, &models.MesData{}, &models.Gasto{})
}
