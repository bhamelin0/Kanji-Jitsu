package main

import (
	"encoding/json"
	"database/sql"
	"fmt"
	"log"
	"os"
	_ "github.com/lib/pq"
	"github.com/gofiber/fiber/v2"
)

type PostgreServerConn struct {
	Host string `json:"host"`
	Port int `json:"port"`
	User string `json:"user"`
	Password string `json:"password"`
	Dbname string `json:"dbname"`
}

func initEnv() PostgreServerConn {
	data, err := os.ReadFile("env.json")
	if err != nil {
		log.Fatal(err)
	}
	
	var envData PostgreServerConn
	err = json.Unmarshal(data, &envData)
    if err != nil {
        fmt.Printf("There was an error decoding the json. err = %s", err)
    }

	return envData
}

func indexHandler(c *fiber.Ctx, db *sql.DB) error {
	var selectString = "SELECT * FROM kanji WHERE id = 1"

	rows, err := db.Query(selectString)
	defer rows.Close()
	if err != nil {
		log.Fatalln(err)
		c.JSON("An error occured")
	}

	rows.Next()
	var (
		id   int
		kanji string
		nlevel int
	)

	if err := rows.Scan(&id, &kanji, &nlevel); err != nil {
		log.Fatal(err)
	}

	return c.SendString("Hello, your kanji is " + kanji );
}
 
 func postHandler(c *fiber.Ctx, db *sql.DB) error {
	return c.SendString("Hello")
}

func main() {
	var env = initEnv()
	
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
    "password=%s dbname=%s sslmode=disable",
    env.Host, env.Port, env.User, env.Password, env.Dbname)

	// Connect to database
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return indexHandler(c, db)
	})

	app.Post("/", func(c *fiber.Ctx) error {
		return postHandler(c, db)
	})
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}