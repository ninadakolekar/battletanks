package client

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"
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

//ReadFromWebSocket ... To read messages sent by client over the websocket
func (c *Client) ReadFromWebSocket() {
	log.Println("ReadFromWebSocket() called...")
	for {
		_, data, err := c.Ws.ReadMessage()

		if err != nil {
			log.Println("ReadFromWebSocket : ", err)
			return
		}

		c.ProcessClientData(data)
	}
}

//ProcessClientData ...
func (c *Client) ProcessClientData(msg []byte) {
	s := string(msg[:])
	fmt.Println("Message Received from Client: ", s)
}
