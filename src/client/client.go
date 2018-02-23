package client

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"

	"../message"
)

//Client ...
type Client struct {
	ID uint32
	Ws *websocket.Conn
}

//NewClient ... Returns a new Client object
func NewClient(ws *websocket.Conn, id uint32) *Client {

	if ws == nil {
		panic("Websocket* is nil.")
	}

	return &Client{id, ws}
}

//Conn ... Returns the websocket of client
func (c *Client) Conn() *websocket.Conn {
	return c.Ws
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
		_, data, err := c.Ws.ReadMessage()

		if err != nil {
			log.Println("ReadFromWebSocket : ", err)
			return
		}

		c.processClientData(data)
	}
}

//processClientData ...
func (c *Client) processClientData(msg []byte) {
	s := string(msg[:])
	fmt.Println("Message Received from Client: ", s)
}

func (c *Client) listenWrite() {
	log.Println("Writing to Websocket now...")
	// msg := []byte("Hi Client. I'm the server.")
	// err := c.Ws.WriteMessage(websocket.TextMessage, msg)
	msg := message.Message{
		Username: "gorilla",
		Message:  "Hi Client. I'm the gorilla server.",
	}
	err := c.Ws.WriteJSON(&msg)
	if err != nil {
		log.Println("listenWrite :", err)
	}
}
