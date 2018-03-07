// Package constants ... This package exports various constant values used during gameplay.
package constants

import "time"

const (

	// UpdateRequestInterval ... Interval after which gameplay-update (of a client) is requested by server
	UpdateRequestInterval = 20 * time.Millisecond

	// MaxNumberOfClients ... Maximum number of clients allowed to be connected during the game
	MaxNumberOfClients = 4

	// ChanBufferSize ... Buffer Size of Channels (in Client Struct)
	ChanBufferSize = 100

	//ReadBufferSize ... Buffer Size of each Concurrent WebSocket Reader
	ReadBufferSize = 1024

	//WriteBufferSize ... Buffer Size of each Concurrent WebSocket Writer
	WriteBufferSize = 1024
)
