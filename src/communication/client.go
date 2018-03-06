package communication

import (
	"log"

	constants "github.com/IITH-POPL2-Jan2018/concurrency-13/src/constants"
	message "github.com/IITH-POPL2-Jan2018/concurrency-13/src/message"
	"github.com/gorilla/websocket"
)

//Client ... Client Structure to hold variables of a client
type Client struct {
	ID        uint32
	server    *Server
	Ws        *websocket.Conn
	ch        chan message.Message
	updateCh  chan message.UpdateMessage
	newUserCh chan message.NewClientMessage
}

//NewClient ... Returns a new Client object
func NewClient(server *Server, ws *websocket.Conn, id uint32) *Client {

	if ws == nil {
		panic("Websocket* is nil.")
	}

	ch := make(chan message.Message, constants.ChanBufferSize)

	updateCh := make(chan message.UpdateMessage, constants.ChanBufferSize)

	newUserCh := make(chan message.NewClientMessage, constants.ChanBufferSize)

	return &Client{id, server, ws, ch, updateCh, newUserCh}
}

//Conn ... Returns the websocket of client
func (c *Client) Conn() *websocket.Conn {
	return c.Ws
}

//Listen ... Make Client Listen to Writer and Reader over the WebSocket
func (c *Client) Listen() {
	go c.listenWrite()
	c.listenRead()
}

//listenRead ... To read messages sent by client over the websocket
func (c *Client) listenRead() {

	defer func() {
		err := c.Ws.Close()
		if err != nil {
			log.Println("Client Close() Error:", err.Error())
		}
	}()

	log.Println("ReadFromWebSocket() called...")
	for {

		msg := message.UpdateMessage{}
		err := c.Ws.ReadJSON(&msg)

		if err != nil {
			log.Println("ReadFromWebSocket : ", err.Error())
			return
		}
		log.Println("Received Update: ", msg)

		go c.UpdateSender(msg)
	}
}

func (c *Client) listenWrite() {

	defer func() {
		err := c.Ws.Close()
		if err != nil {
			log.Println("Client Close() Error:", err.Error())
		}
	}()

	log.Println("Listening for Write to Client")

	for {
		select {
		case msg := <-c.ch:
			err := c.Ws.WriteJSON(&msg)
			if err != nil {
				log.Println("listenWrite :", err.Error())
			}
		case msg := <-c.updateCh:
			err := c.Ws.WriteJSON(&msg)
			if err != nil {
				log.Println("listenWrite :", err.Error())
			}
		case msg := <-c.newUserCh:
			err := c.Ws.WriteJSON(&msg)
			if err != nil {
				log.Println("listenWrite newUserCh:", err.Error())
			}
		}
	}

}

//HandleNewUserConnected ... Handles new user connection
func (c *Client) HandleNewUserConnected(id uint32) {

	go c.SendID()

	// msg := message.NewClientMessage{id, "newUser"}
	// go c.server.BroadcastNewUser(msg)

	// for _, cl := range c.server.Clients {
	// 	if cl.ID != id {
	// 		msg := message.NewClientMessage{cl.ID, "newUser"}
	// 		c.SendNewUserMessage(msg)
	// 	}
	// }
}
