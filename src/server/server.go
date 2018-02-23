package server

import (
	"fmt"
	"log"
	"net/http"

	"../client"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // To convert HTTP GET Request to WebSocket

// Server ... Structure: Server
type Server struct {
	Pattern     string
	ClientCount uint32
	Clients     map[uint32]*client.Client // User Connections
	Upgrader    *websocket.Upgrader
}

// NewServer ... Function to initialize new server
func NewServer(pattern string) *Server {
	return &Server{
		Pattern:     pattern,
		ClientCount: uint32(0),
		Clients:     make(map[uint32]*client.Client),
		Upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			}},
	}
}

// Listen ... Make the server listen
func (s *Server) Listen() {
	log.Println("Listening Server ...")

	handler := func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Client Count after entry: ", s.ClientCount)
		conn, err := s.Upgrader.Upgrade(w, r, nil)
		fmt.Println("Client Count after upgrade: ", s.ClientCount)

		if err != nil {
			log.Println("Upgrade : ", err)
			return
		}
		fmt.Println("Client Count after err: ", s.ClientCount)

		cl := client.NewClient(conn, s.ClientCount)

		fmt.Println("Client Count after newC: ", s.ClientCount)

		s.Clients[cl.ID] = cl
		fmt.Println("Client Count after acc: ", s.ClientCount)
		s.ClientCount = s.ClientCount + 1

		log.Println("Added new client. Now", len(s.Clients), "clients connected.")

		go cl.ReadFromWebSocket()

	}

	http.HandleFunc(s.Pattern, handler)
}
