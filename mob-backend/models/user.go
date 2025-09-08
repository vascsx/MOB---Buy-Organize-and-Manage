package models

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"uniqueIndex" json:"username"`
	Password string `json:"password"`
	MesDatas []MesData
}
