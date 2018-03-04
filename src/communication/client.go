package communication

import (
	"fmt"
	"log"

	message "../message"
	"github.com/gorilla/websocket"
)

const bufferSize = 100

//Client ...
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

	ch := make(chan message.Message, bufferSize)

	updateCh := make(chan message.UpdateMessage, bufferSize)

	newUserCh := make(chan message.NewClientMessage, bufferSize)

	return &Client{id, server, ws, ch, updateCh, newUserCh}
}

//Conn ... Returns the websocket of client
func (c *Client) Conn() *websocket.Conn {
	return c.Ws
}

//SendMessage ... Sends message to the client
func (c *Client) SendMessage(msg message.Message) {
	select {
	case c.ch <- msg:
	}
}

//SendUpdate ... Sends update to the client
func (c *Client) SendUpdate(msg message.UpdateMessage) {
	select {
	case c.updateCh <- msg:
	}
}

//SendNewUserMessage ... Sends message to the client
func (c *Client) SendNewUserMessage(msg message.NewClientMessage) {
	select {
	case c.newUserCh <- msg:
	}
}

//Listen ... Make Client Listen
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
		// _, data, err := c.Ws.ReadMessage()

		msg := message.UpdateMessage{}
		err := c.Ws.ReadJSON(&msg)

		if err != nil {
			log.Println("ReadFromWebSocket : ", err.Error())
			return
		}
		log.Println("Received Update: ", msg)

		go c.processClientData(msg)
	}
}

//processClientData ... Process response to message received from client
func (c *Client) processClientData(msg message.UpdateMessage) {
	fmt.Println("Message Received from Client: ", msg)

	for _, cl := range c.server.Clients {

		go func(c *Client, cl *Client, msg message.UpdateMessage) {
			if c.ID != cl.ID {
				msg.Message = "applyUpdate"
				cl.SendUpdate(msg)
			}
		}(c, cl, msg)

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

//NewUserConnected ... Handles new user connection
func (c *Client) NewUserConnected(id uint32) {

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

//SendID ... Sends Client ID to ClientJS
func (c *Client) SendID() {
	msg := message.NewClientMessage{c.ID, "notifyID"}
	c.SendNewUserMessage(msg)
}
