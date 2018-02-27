package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	server "./server"
)

/* MAIN */

func main() {

	server := server.NewServer("/")
	fmt.Println("Client Count before gor: ", server.ClientCount)
	go server.Listen()
	ticker := time.NewTicker(time.Millisecond * 500)
	go func() {
		for t := range ticker.C {
			server.Broadcast()
			fmt.Println("Tick at", t)
		}
	}()
	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(":8080", nil))
	fmt.Println(server.Pattern)

}
