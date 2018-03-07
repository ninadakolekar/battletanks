package communication

import message "github.com/IITH-POPL2-Jan2018/concurrency-13/src/message"

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

//SendID ... Sends Client ID to ClientJS
func (c *Client) SendID() {
	msg := message.NewClientMessage{ID: c.ID, Message: "notifyID"}
	c.SendNewUserMessage(msg)
}
