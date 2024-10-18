package main

import (
	"KanjiWordle/src/KanjiDBLib"
	"KanjiWordle/src/PostgresConn"
	"context"
	"database/sql"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var dbConn *sql.DB

func IsLambda() bool {
	if lambdaTaskRoot := os.Getenv("LAMBDA_TASK_ROOT"); lambdaTaskRoot != "" {
		return true
	}
	return false
}

func init() {
	if IsLambda() {
		PostgresConn.SetEnvFromFile("envAWS.json")
	} else {
		PostgresConn.SetEnvFromFile("env.json")
	}
	dbConn, _ = PostgresConn.ConnectDB(os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DBNAME"), os.Getenv("POSTGRES_SSL"))

}

func UpdateDailyKanji() {
	KanjiDBLib.UpdateDailyKanji(dbConn)
}

func main() {
	if IsLambda() {
		lambda.Start(Handler)
	} else {
		UpdateDailyKanji()
	}

}

func Handler(ctx context.Context, request events.APIGatewayProxyRequest) error {
	UpdateDailyKanji()
	return nil
}
