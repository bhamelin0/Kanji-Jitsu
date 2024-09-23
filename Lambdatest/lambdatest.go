package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"

	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq"
)

func hello() (string, error) {
	db, err := PostgresConn.ConnectDB("envAWS.json")

	if err != nil {
		return "error with init: ", err
	}
	KanjiDBLib.InitializeNewKanjiJitsuDB(db)
	return "Database Initialized:", err

}

func main() {
	// Make the handler available for Remote Procedure Call by AWS Lambda
	lambda.Start(hello)
}
