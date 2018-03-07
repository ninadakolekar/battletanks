// Package communication ... This package manages communication between the server-side and client-side of the game. It also contains functions to manage new and current user connections.
package communication

import (
	"log"
	"net/http"

	constants "github.com/IITH-POPL2-Jan2018/concurrency-13/src/constants"
	message "github.com/IITH-POPL2-Jan2018/concurrency-13/src/message"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{} // To convert HTTP GET Request to WebSocket

// Server ... Structure: Server
type Server struct {
	Pattern      string              // URL of the server
	ClientCount  uint32              // Number of Clients Connected
	Clients      map[uint32]*Client  // User Connections
	Upgrader     *websocket.Upgrader // HTTP to WebSocket Upgrader
	CeaseUpdates chan bool           // To indicate stop updates when result of gameplay is decided
}

// NewServer ... Function to initialize new server
func NewServer(pattern string) *Server {
	return &Server{
		Pattern:     pattern,
		ClientCount: uint32(0),
		Clients:     make(map[uint32]*Client),
		Upgrader: &websocket.Upgrader{
			ReadBufferSize:  constants.ReadBufferSize,
			WriteBufferSize: constants.WriteBufferSize,
			CheckOrigin: func(r *http.Request) bool {
				return true
			}},
		CeaseUpdates: make(chan bool),
	}
}

// Listen ... Make the server listen
func (s *Server) Listen() {
	log.Println("Listening Server ...")

	handler := func(w http.ResponseWriter, r *http.Request) {

		if s.validateUser() {

			conn, err := s.Upgrader.Upgrade(w, r, nil)

			if err != nil {
				log.Fatalln("Error (Upgrade) : ", err)
				return
			}

			cl := NewClient(s, conn, s.nextClientID())

			s.Clients[cl.ID] = cl

			s.ClientCount = s.ClientCount + 1

			log.Println("Added new client. Now", len(s.Clients), "clients connected.")

			cl.HandleNewUserConnected(cl.ID)
			cl.Listen()
		} else {

			log.Fatalln("Maximum Connections Limit Reached! Rejecting any further requests.")

		}

	}

	http.HandleFunc(s.Pattern, handler)
}

//SendMessageToClient ... Send message to a particular client
func (s *Server) SendMessageToClient(clientID uint32, msg message.Message) {

	client, found := s.Clients[clientID]

	if found {
		client.SendMessage(msg)
	} else {
		log.Printf("Error (SendMessageToClient) : Client %d not found!\n", clientID)
		return
	}

}

//validateUser ... Checks whether a new user is permitted or not
func (s *Server) validateUser() bool {

	return s.ClientCount < constants.MaxNumberOfClients

}

//nextClientID ... Returns the index (ID) to be assigned to the new client
func (s *Server) nextClientID() uint32 {
	return s.ClientCount
}
