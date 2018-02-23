package server

import (
	"../client"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // To convert HTTP GET Request to WebSocket

// Server ... Structure: Server
type Server struct {
	pattern string
	clients map[uint32]*client.Client // User Connections
}

// NewChatServer ... Function to initialize new server
func newServer(pattern string) *Server {
	return &Server{
		pattern: pattern,
		clients: make(map[uint32]*client.Client),
	}
}
