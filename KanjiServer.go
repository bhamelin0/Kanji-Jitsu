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
	"github.com/gofiber/fiber/v2/middleware/cors"
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

// func initializeKanjiDB(c *fiber.Ctx, db *sql.DB) error {
// 	KanjiDBLib.InitializeNewKanjiJitsuDB(db)
// 	KanjiDBLib.PopulateKanjiTable(db)
// 	return c.SendString("Populated")
// }

// func populateKanjiVocabHandler(c *fiber.Ctx, db *sql.DB) error {
// 	jsonData := new(KanjVocabBody)
// 	if err := c.BodyParser(&jsonData); err != nil {
// 		return err
// 	}

// 	targetKanji := jsonData.Kanji
// 	fmt.Println("target kanji is" + targetKanji)
// 	KanjiDBLib.InitVocabForKanji(db, targetKanji)
// 	return c.SendString("Target kanji vocab updated")
// }

// func initializeEverythingHandler(c *fiber.Ctx, db *sql.DB) error {
// 	KanjiDBLib.InitializeNewKanjiJitsuDB(db)
// 	KanjiDBLib.PopulateKanjiTable(db)
// 	KanjiDBLib.InitVocabForAllKanji(db)
// 	return c.SendString("Populated")
// }

// func updateKanjiOfDay(c *fiber.Ctx, db *sql.DB) error {
// 	KanjiDBLib.UpdateDailyKanji(db)
// 	return c.SendString("The new kanji are set")
// }

// func initHandler(c *fiber.Ctx) error {
// 	Init()
// 	return c.SendString("Database Initialized")
// }

func getDailyKanjiHandler(c *fiber.Ctx, db *sql.DB) error {
	kanjiList := KanjiDBLib.GetKanjiDailyListObj(db)
	return c.JSON(kanjiList)
}

func getVocabForKanjiHandler(c *fiber.Ctx, db *sql.DB) error {
	m := c.Queries()
	kanji := m["kanji"]
	vocab := KanjiDBLib.GetKanjiOfDayObj(db, kanji)
	return c.JSON(vocab)
}

func serveStatic(app *fiber.App) {
	app.Static("/", "./kanjijitsu/build")
}

func main() {
	PostgresConn.SetEnvFromFile("envAWS2.json")

	db, _ := PostgresConn.ConnectDB(os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DBNAME"), os.Getenv("POSTGRES_SSL"))
	app := fiber.New()
	app.Use(cors.New())

	log.Println(("DB connected to " + os.Getenv("POSTGRES_HOST") + " waiting for requests"))

	serveStatic(app)

	app.Get("/test", func(c *fiber.Ctx) error {
		return indexHandler(c, db)
	})

	app.Get("/dailyKanji", func(c *fiber.Ctx) error {
		return getDailyKanjiHandler(c, db)
	})

	app.Get("/vocabForKanji", func(c *fiber.Ctx) error {
		return getVocabForKanjiHandler(c, db)
	})

	// app.Post("/updateKanjiOfday", func(c *fiber.Ctx) error {
	// 	return updateKanjiOfDay(c, db)
	// })

	// app.Post("/populateKanji", func(c *fiber.Ctx) error {
	// 	return initializeKanjiDB(c, db)
	// })

	// // Expects json body with kanji: kanji
	// app.Post("/populateVocab", func(c *fiber.Ctx) error {
	// 	return populateKanjiVocabHandler(c, db)
	// })

	// // Runs down the full kanji list and populates it completely
	// app.Post("/initializeEverything", func(c *fiber.Ctx) error {
	// 	return initializeEverythingHandler(c, db)
	// })

	// Expects json body with kanji: kanji
	// app.Post("/init", func(c *fiber.Ctx) error {
	// 	return initHandler(c)
	// })

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}
