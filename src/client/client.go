package client

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"

	"../message"
)

const bufferSize = 100

//Client ...
type Client struct {
	ID uint32
	Ws *websocket.Conn
	ch chan message.Message
}

//NewClient ... Returns a new Client object
func NewClient(ws *websocket.Conn, id uint32) *Client {

	if ws == nil {
		panic("Websocket* is nil.")
	}

	ch := make(chan message.Message, bufferSize)

	return &Client{id, ws, ch}
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

//Listen ... Make Client Listen
func (c *Client) Listen() {
	go c.listenWrite()
	c.listenRead()
}

//listenRead ... To read messages sent by client over the websocket
func (c *Client) listenRead() {
	log.Println("ReadFromWebSocket() called...")
	for {
		// _, data, err := c.Ws.ReadMessage()

		msg := message.Message{}
		err := c.Ws.ReadJSON(&msg)
		if err != nil {
			log.Println("ReadFromWebSocket : ", err)
			return
		}

		c.processClientData(msg)
	}
}

//processClientData ...
func (c *Client) processClientData(msg message.Message) {
	fmt.Println("Message Received from Client: ", msg)
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
				log.Println("listenWrite :", err)
			}
		}
	}

}

//checkAlive ... Checks if client is active
func (c* Client)