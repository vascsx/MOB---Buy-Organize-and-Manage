package models

import "time"

type MemberRole string

const (
	RoleOwner     MemberRole = "owner"
	RoleMember    MemberRole = "member"
	RoleDependent MemberRole = "dependent"
)

type FamilyMember struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	FamilyAccountID uint       `gorm:"not null;index" json:"family_account_id"`
	UserID          *uint      `gorm:"index" json:"user_id"` // nullable: pode ser dependente (filho)
	Name            string     `gorm:"not null" json:"name"`
	Role            MemberRole `gorm:"default:'member'" json:"role"`
	IsActive        bool       `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Relacionamentos
	FamilyAccount FamilyAccount `gorm:"foreignKey:FamilyAccountID" json:"family_account,omitempty"`
	User          *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Incomes       []Income      `gorm:"foreignKey:FamilyMemberID" json:"incomes,omitempty"`
}
