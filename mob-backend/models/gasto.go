package models

type Gasto struct {
	ID        uint    `gorm:"primaryKey"`
	Categoria string  `json:"categoria"`
	Descricao string  `json:"descricao"`
	Valor     float64 `json:"valor"`
	MesDataID uint
}
