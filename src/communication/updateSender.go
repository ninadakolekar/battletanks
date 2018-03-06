package communication

import (
	"log"

	message "github.com/IITH-POPL2-Jan2018/concurrency-13/src/message"
)

//UpdateSender ... Process response to message received from client
func (c *Client) UpdateSender(msg message.UpdateMessage) {
	log.Println("Message Received from Client: ", msg)

	for _, cl := range c.server.Clients {

		go func(c *Client, cl *Client, msg message.UpdateMessage) {
			if c.ID != cl.ID {
				msg.Message = "applyUpdate"
				cl.SendUpdate(msg)
			}
		}(c, cl, msg)

	}

	if msg.Won {
		c.server.CeaseUpdates <- true
	}
}
