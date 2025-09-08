package models

type MesData struct {
	ID      uint    `gorm:"primaryKey"`
	MesAno  string  `gorm:"uniqueIndex:idx_user_mesano"`
	Renda   float64 `json:"renda"`
	UserID  uint    `gorm:"uniqueIndex:idx_user_mesano"`
	Gastos  []Gasto `gorm:"foreignKey:MesDataID"`
}
