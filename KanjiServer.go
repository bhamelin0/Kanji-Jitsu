package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"
	"context"
	"database/sql"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	fiberadapter "github.com/awslabs/aws-lambda-go-api-proxy/fiber"
	"github.com/gofiber/fiber/v2"
)

var fiberLambda *fiberadapter.FiberLambda

func IsLambda() bool {
	if lambdaTaskRoot := os.Getenv("LAMBDA_TASK_ROOT"); lambdaTaskRoot != "" {
		return true
	}
	return false
}

func getDailyKanjiHandler(c *fiber.Ctx, db *sql.DB) error {
	kanjiList := KanjiDBLib.GetKanjiDailyListObj(db)
	return c.JSON(kanjiList)
}

func serveStatic(app *fiber.App) {
	app.Static("/", "./kanjijitsu/build")
}

func main() {
	app := fiber.New()

	PostgresConn.SetEnvFromFile("envAWS2.json")
	db, _ := PostgresConn.ConnectDB(os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DBNAME"), os.Getenv("POSTGRES_SSL"))

	serveStatic(app)
	app.Get("/test2", func(c *fiber.Ctx) error {
		return c.SendString("Server is running normally TWO")
	})

	app.Get("/dailyKanji", func(c *fiber.Ctx) error {
		return getDailyKanjiHandler(c, db)
	})

	PostgresConn.SetEnvFromFile("envAWS2.json")

	if IsLambda() {
		fiberLambda = fiberadapter.New(app)
		lambda.Start(Handler)
	} else {
		app.Listen(":3000")
	}
}

func Handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return fiberLambda.ProxyWithContext(ctx, request)
}
