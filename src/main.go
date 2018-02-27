package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	message "./message"
	server "./server"
)

/* MAIN */

func main() {

	server := server.NewServer("/")
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

	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(":8080", nil))
	fmt.Println(server.Pattern)

}
