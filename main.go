package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	comm "github.com/IITH-POPL2-Jan2018/concurrency-13/src/communication"
	constants "github.com/IITH-POPL2-Jan2018/concurrency-13/src/constants"
	message "github.com/IITH-POPL2-Jan2018/concurrency-13/src/message"
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

	go updateServiceRoutine(server)

	fmt.Println("Client Count after gor: ", server.ClientCount)
	log.Fatal(http.ListenAndServe(addr, nil))
	fmt.Println(server.Pattern)

}

func updateServiceRoutine(s *comm.Server) {

	/* UPDATE Service */
	ticker := time.NewTicker(constants.UpdateRequestInterval) // 2 seconds
	go func() {
		for range ticker.C {

			select {

			case stop := <-s.CeaseUpdates:
				if stop {
					return
				}

			default:
				uSignal := message.Message{"requestUpdate"}
				s.Broadcast(uSignal)
				// fmt.Println("Tick at", t)

			}
		}
	}()

}
