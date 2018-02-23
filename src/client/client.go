package client

import (
	"github.com/gorilla/websocket"
)

//Client ...
type Client struct {
	id uint32
	ws *websocket.Conn
}

//newClient ... Returns a new Client object
func newClient(ws *websocket.Conn, id uint32) *Client {

	if ws == nil {
		panic("Websocket* is nil.")
	}

	return &Client{id, ws}
}

//Conn ... Returns the websocket of client
func (c *Client) Conn() *websocket.Conn {
	return c.ws
}
