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

	/* UPDATE Service */

	utick := time.NewTicker(time.Millisecond * 100) // 100 milliseconds

	go func() {

		for range utick.C {
			// make getUpdate signal
			uSignal := message.Message{"getUpdate"}
			server.Broadcast(uSignal)
			// log.Println("Update Signal from server sent at ", t)
		}

	}()

	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(":8080", nil))
	fmt.Println(server.Pattern)

}
