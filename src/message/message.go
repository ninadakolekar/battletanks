package message

// Message ... Structure: Message
type Message struct {
	Username string `json:"username"` // 1
	Message  string `json:"message"`  // 2
}

//NewClientMessage ... Structure: New Client Message
type NewClientMessage struct {
	ID      uint32 `json:"id"`      // 1
	Message string `json:"message"` // 2
}

//UpdateMessage ... Structure: Gameplay Update Message
type UpdateMessage struct {
	ID       uint32 `json:"id"`       // 1
	Message  string `json:"message"`  // 2
	BoxColor string `json:"boxColor"` // Color of the box
}
