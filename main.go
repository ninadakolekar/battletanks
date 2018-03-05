package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	comm "github.com/ninadakolekar/concurrency-13/src/communication"
	message "github.com/ninadakolekar/concurrency-13/src/message"
)

func determineListenAddress() (string, error) {
	port := os.Getenv("PORT")
	if port == "" {
		return "", fmt.Errorf("$PORT not set")
	}
	return ":" + port, nil
}

/* MAIN */

func main() {

	addr, err := determineListenAddress()
	if err != nil {
		log.Fatal(err)
	}

	server := comm.NewServer("/")
	fmt.Println("Client Count before gor: ", server.ClientCount)

	go server.Listen()

	/* UPDATE Service */
	ticker := time.NewTicker(time.Millisecond * 20) // 2 seconds
	go func() {
		for t := range ticker.C {
			// make message msg here
			uSignal := message.Message{"requestUpdate"}
			server.Broadcast(uSignal)
			fmt.Println("Tick at", t)
		}
	}()

	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(addr, nil))
	fmt.Println(server.Pattern)

}
