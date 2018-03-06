package message

// Message ... Structure: Message
type Message struct {
	Message string `json:"message"` // 2
}

//NewClientMessage ... Structure: New Client Message
type NewClientMessage struct {
	ID      uint32 `json:"id"`      // 1
	Message string `json:"message"` // 2
}

//UpdateMessage ... Structure: Gameplay Update Message
type UpdateMessage struct {
	ID      uint32 `json:"id"`      // 1
	Message string `json:"message"` // 2

	TankX       uint32  `json:"tank_x"`
	TankY       uint32  `json:"tank_y"`
	RotationInc float32 `json:"rotationIncrement"`

	BulletCount uint32 `json:"bulletCount"`
	BulletX     uint32 `json:"bullet_x"`
	BulletY     uint32 `json:"bullet_y"`

	OtherX uint32 `json:"other_x"`
	OtherY uint32 `json:"other_y"`

	CenterX    uint32 `json:"center_x"`
	CenterY    uint32 `json:"center_y"`
	Health     uint32 `json:"health"`
	Exit       bool   `json:"exit"`
	Won        bool   `json:"won"`
	BrokenTile int32  `json:"tile_index"`
	HitWall    bool   `json:"hitwall"`
	BulletDirection uint32	`json:"bullet_direction"`
}
