package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"unique;not null" json:"email"`
	Username  string    `gorm:"uniqueIndex" json:"username"`
	Password  string    `gorm:"not null" json:"-"` // never return password in JSON
	Name      string    `gorm:"not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relacionamentos antigos (manter compatibilidade)
	MesDatas []MesData `gorm:"foreignKey:UserID" json:"mes_datas,omitempty"`

	// Novos relacionamentos
	OwnedFamilies  []FamilyAccount `gorm:"foreignKey:OwnerUserID" json:"owned_families,omitempty"`
	FamilyMembers  []FamilyMember  `gorm:"foreignKey:UserID" json:"family_members,omitempty"`
}
