package PostgresConn

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	_ "github.com/lib/pq"
)

type PostgreServerConn struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Dbname   string `json:"dbname"`
}

func ConnectDBFromFile(envFile string) (db *sql.DB, err error) {
	var env = initEnv(envFile)
	log.Println(("Connected to " + env.Host))
	return ConnectDB(env.Host, strconv.Itoa(env.Port), env.User, env.Password, env.Dbname)
}

func ConnectDB(host string, port string, user string, password string, dbname string) (db *sql.DB, err error) {

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// Connect to database
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Printf("Error during postgres conn: %v", err)
	}

	return db, err
}

func initEnv(envFile string) PostgreServerConn {
	data, err := os.ReadFile(envFile)
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
