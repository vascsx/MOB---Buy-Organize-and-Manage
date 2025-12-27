package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"finance-backend/models"
)

var DB *gorm.DB

func InitDB() {
	// Lê variáveis de ambiente
	dbHost := getEnv("DB_HOST", "localhost")
	dbUser := getEnv("DB_USER", "mobuser")
	dbPassword := getEnv("DB_PASSWORD", "mobpass123")
	dbName := getEnv("DB_NAME", "mob_finance")
	dbPort := getEnv("DB_PORT", "5432")
	sslMode := getEnv("DB_SSL_MODE", "disable")

	// Constrói DSN
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		dbHost, dbUser, dbPassword, dbName, dbPort, sslMode,
	)

	// Configuração do GORM
	config := &gorm.Config{}
	
	// Em desenvolvimento, mostra SQL queries
	if os.Getenv("GIN_MODE") != "release" {
		config.Logger = logger.Default.LogMode(logger.Info)
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		log.Fatal("Erro ao conectar no banco:", err)
	}

	log.Println("✅ Conectado ao banco de dados:", dbName)

	// AutoMigrate dos models
	err = DB.AutoMigrate(
		&models.User{},
		&models.MesData{},
		&models.Gasto{},
		// Novos models
		&models.FamilyAccount{},
		&models.FamilyMember{},
		&models.Income{},
		&models.ExpenseCategory{},
		&models.Expense{},
		&models.ExpenseSplit{},
		&models.Investment{},
		&models.EmergencyFund{},
	)
	
	if err != nil {
		log.Fatal("Erro ao executar migrations:", err)
	}
	
	log.Println("✅ Migrations executadas com sucesso")
}

// getEnv retorna o valor da variável de ambiente ou o valor padrão
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
