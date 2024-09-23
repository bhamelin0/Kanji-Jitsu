package PostgresConn

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
)

type PostgreServerConn struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Dbname   string `json:"dbname"`
}

func ConnectDB(envFile string) (db *sql.DB, err error) {
	var env = initEnv(envFile)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s",
		env.Host, env.Port, env.User, env.Password, env.Dbname)

	// Connect to database
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
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
