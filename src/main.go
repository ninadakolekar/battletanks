package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	comm "./communication"
	message "./message"
)

/* MAIN */

func main() {

	server := comm.NewServer("/")
	fmt.Println("Client Count before gor: ", server.ClientCount)
	go server.Listen()

	/* TEST Broadcast() Service */
	ticker := time.NewTicker(time.Millisecond * 2000) // 2 seconds
	go func() {
		for t := range ticker.C {
			// make message msg here
			msg := message.Message{"user_random101", "red"}
			server.Broadcast(msg)
			fmt.Println("Tick at", t)
		}
	}()

	/* UPDATE Service */
	utick := time.NewTicker(time.Millisecond * 6000) // 20 milliseconds
	go func() {
		for range utick.C {
			// make getUpdate signal
			uSignal := message.Message{"user_random101", "getUpdate"}
			server.Broadcast(uSignal)
			// log.Println("Update Signal from server sent at ", t)
		}
	}()

	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(":8080", nil))
	fmt.Println(server.Pattern)

}
