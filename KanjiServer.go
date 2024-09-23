package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	_ "github.com/lib/pq"
)

type PostgreServerConn struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Dbname   string `json:"dbname"`
}

type KanjVocabBody struct {
	Kanji string `json:"kanji"`
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
	var selectString = "SELECT * FROM kanji WHERE id = 3778"

	rows, err := db.Query(selectString)
	if err != nil {
		log.Fatalln(err)
		c.JSON("An error occured")
	}

	defer rows.Close()

	rows.Next()
	var (
		id       int
		kanji    string
		nlevel   int
		consumed bool
	)

	if err := rows.Scan(&id, &kanji, &nlevel, &consumed); err != nil {
		log.Fatal(err)
	}

	return c.SendString("Hello, your kanji is " + kanji)
}

func initializeKanjiDB(c *fiber.Ctx, db *sql.DB) error {
	KanjiDBLib.InitializeNewKanjiJitsuDB(db)
	return c.SendString("Populated")
}

func populateKanjiVocabHandler(c *fiber.Ctx, db *sql.DB) error {
	jsonData := new(KanjVocabBody)
	if err := c.BodyParser(&jsonData); err != nil {
		return err
	}

	targetKanji := jsonData.Kanji
	fmt.Println("target kanji is" + targetKanji)
	KanjiDBLib.InitVocabForKanji(db, targetKanji)
	return c.SendString("Target kanji vocab updated")
}

func getKanjiOfdayHandler(c *fiber.Ctx, db *sql.DB) error {
	vocab := KanjiDBLib.GetKanjiOfDayObj(db, "力")
	return c.JSON(vocab)
}

func initHandler(c *fiber.Ctx) error {
	Init()
	return c.SendString("Database Initialized")
}

func main() {
	db, _ := PostgresConn.ConnectDB("envAWS.json")
	app := fiber.New()

	app.Get("/test", func(c *fiber.Ctx) error {
		return indexHandler(c, db)
	})

	app.Get("/kanjiDay", func(c *fiber.Ctx) error {
		return getKanjiOfdayHandler(c, db)
	})

	app.Post("/populateKanji", func(c *fiber.Ctx) error {
		return initializeKanjiDB(c, db)
	})

	// Expects json body with kanji: kanji
	app.Post("/populateVocab", func(c *fiber.Ctx) error {
		return populateKanjiVocabHandler(c, db)
	})

	// Expects json body with kanji: kanji
	app.Post("/init", func(c *fiber.Ctx) error {
		return initHandler(c)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}
