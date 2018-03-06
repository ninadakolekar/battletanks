package communication

import (
	"log"

	message "github.com/IITH-POPL2-Jan2018/concurrency-13/src/message"
)

//Broadcast ... Send message to all the clients
func (s *Server) Broadcast(msg message.Message) {
	for _, c := range s.Clients {
		go c.SendMessage(msg)
		// log.Println("Broadcasted now...")
	}
}

//BroadcastNewUser ... Send message to all the clients
func (s *Server) BroadcastNewUser(msg message.NewClientMessage) {
	for _, c := range s.Clients {
		c.SendNewUserMessage(msg)
		log.Println("Broadcasted New User now...")
	}
}
