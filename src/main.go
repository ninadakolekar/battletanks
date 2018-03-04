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
	ticker := time.NewTicker(time.Millisecond * 2000) // 2 seconds
	go func() {
		for t := range ticker.C {
			// make message msg here
			uSignal := message.Message{"requestUpdate"}
			server.Broadcast(uSignal)
			fmt.Println("Tick at", t)
		}
	}()

	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(":8080", nil))
	fmt.Println(server.Pattern)

}
