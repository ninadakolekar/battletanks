package main

import (
	"fmt"
	"log"
	"net/http"

	server "./server"
)

/* MAIN */

func main() {

	server := server.NewServer("/")
	fmt.Println("Client Count before gor: ", server.ClientCount)
	go server.Listen()
	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(":8080", nil))
	fmt.Println(server.Pattern)

}
