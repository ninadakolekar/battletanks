package constants

import "time"

const (

	// UpdateRequestInterval ... Interval after which gameplay-update (of a client) is requested by server
	UpdateRequestInterval = 20 * time.Millisecond

	// MaxNumberOfClients ... Maximum number of clients allowed to be connected during the game
	MaxNumberOfClients = 4
)
