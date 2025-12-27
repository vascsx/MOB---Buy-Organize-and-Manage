package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger estruturado simplificado (sem dependências externas)
type Logger struct {
	serviceName string
	level       LogLevel
}

type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARNING
	ERROR
	FATAL
)

var (
	globalLogger *Logger
	levelNames   = map[LogLevel]string{
		DEBUG:   "DEBUG",
		INFO:    "INFO",
		WARNING: "WARN",
		ERROR:   "ERROR",
		FATAL:   "FATAL",
	}
)

// InitLogger inicializa o logger global
func InitLogger(serviceName string) {
	level := INFO
	
	// Ler nível do ambiente
	if envLevel := os.Getenv("LOG_LEVEL"); envLevel != "" {
		switch envLevel {
		case "DEBUG":
			level = DEBUG
		case "INFO":
			level = INFO
		case "WARNING", "WARN":
			level = WARNING
		case "ERROR":
			level = ERROR
		case "FATAL":
			level = FATAL
		}
	}
	
	globalLogger = &Logger{
		serviceName: serviceName,
		level:       level,
	}
}

// GetLogger retorna o logger global
func GetLogger() *Logger {
	if globalLogger == nil {
		InitLogger("mob-finance-backend")
	}
	return globalLogger
}

// log interno para formatação consistente
func (l *Logger) log(level LogLevel, message string, fields map[string]interface{}) {
	if level < l.level {
		return
	}
	
	timestamp := time.Now().Format("2006-01-02T15:04:05.000Z07:00")
	levelStr := levelNames[level]
	
	// Formato JSON para fácil parsing
	output := fmt.Sprintf(`{"time":"%s","level":"%s","service":"%s","msg":"%s"`, 
		timestamp, levelStr, l.serviceName, message)
	
	// Adicionar campos extras
	for key, value := range fields {
		output += fmt.Sprintf(`,"%s":"%v"`, key, value)
	}
	
	output += "}\n"
	
	// Escrever no stdout/stderr
	if level >= ERROR {
		fmt.Fprint(os.Stderr, output)
	} else {
		fmt.Fprint(os.Stdout, output)
	}
}

// Debug log de debug
func (l *Logger) Debug(message string, fields ...map[string]interface{}) {
	f := make(map[string]interface{})
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(DEBUG, message, f)
}

// Info log de informação
func (l *Logger) Info(message string, fields ...map[string]interface{}) {
	f := make(map[string]interface{})
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(INFO, message, f)
}

// Warning log de aviso
func (l *Logger) Warning(message string, fields ...map[string]interface{}) {
	f := make(map[string]interface{})
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(WARNING, message, f)
}

// Error log de erro
func (l *Logger) Error(message string, fields ...map[string]interface{}) {
	f := make(map[string]interface{})
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(ERROR, message, f)
}

// Fatal log fatal (termina aplicação)
func (l *Logger) Fatal(message string, fields ...map[string]interface{}) {
	f := make(map[string]interface{})
	if len(fields) > 0 {
		f = fields[0]
	}
	l.log(FATAL, message, f)
	os.Exit(1)
}

// GinLogger middleware de logging para Gin
func GinLogger() gin.HandlerFunc {
	logger := GetLogger()
	
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		
		// Processar requisição
		c.Next()
		
		// Calcular tempo
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		
		fields := map[string]interface{}{
			"method":     method,
			"path":       path,
			"query":      query,
			"status":     statusCode,
			"latency_ms": latency.Milliseconds(),
			"client_ip":  clientIP,
		}
		
		// Adicionar user_id se disponível
		if userID, exists := c.Get("user_id"); exists {
			fields["user_id"] = userID
		}
		
		// Adicionar family_id se disponível
		if familyID, exists := c.Get("family_id"); exists {
			fields["family_id"] = familyID
		}
		
		// Log baseado no status
		message := fmt.Sprintf("%s %s", method, path)
		
		if statusCode >= 500 {
			logger.Error(message, fields)
		} else if statusCode >= 400 {
			logger.Warning(message, fields)
		} else {
			logger.Info(message, fields)
		}
	}
}

// GinRecovery middleware de recovery com logging
func GinRecovery() gin.HandlerFunc {
	logger := GetLogger()
	
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered", map[string]interface{}{
					"error":  fmt.Sprintf("%v", err),
					"path":   c.Request.URL.Path,
					"method": c.Request.Method,
				})
				
				c.AbortWithStatusJSON(500, gin.H{
					"error": "Internal server error",
				})
			}
		}()
		
		c.Next()
	}
}

// Funções globais para facilitar uso
func Debug(message string, fields ...map[string]interface{}) {
	GetLogger().Debug(message, fields...)
}

func Info(message string, fields ...map[string]interface{}) {
	GetLogger().Info(message, fields...)
}

func Warning(message string, fields ...map[string]interface{}) {
	GetLogger().Warning(message, fields...)
}

func Error(message string, fields ...map[string]interface{}) {
	GetLogger().Error(message, fields...)
}

func Fatal(message string, fields ...map[string]interface{}) {
	GetLogger().Fatal(message, fields...)
}
