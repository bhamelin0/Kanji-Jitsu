package PostgresConn

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type PostgreServerConn struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Dbname   string `json:"dbname"`
	SslMode  string `json:"sslmode"`
}

func ConnectDBFromFile(envFile string) (db *sql.DB, err error) {
	var env = initEnv(envFile)
	log.Println(("Connected to " + env.Host))
	return ConnectDB(env.Host, env.Port, env.User, env.Password, env.Dbname, env.SslMode)
}

func SetEnvFromFile(envFile string) {
	if _, err := os.Stat(envFile); errors.Is(err, os.ErrNotExist) {
		return
	}
	var env = initEnv(envFile)

	_, ok := os.LookupEnv("POSTGRES_DBNAME")
	if !ok {
		os.Setenv("POSTGRES_DBNAME", env.Dbname)
	}

	_, ok = os.LookupEnv("POSTGRES_HOST")
	if !ok {
		os.Setenv("POSTGRES_HOST", env.Host)
	}

	_, ok = os.LookupEnv("POSTGRES_PASSWORD")
	if !ok {
		os.Setenv("POSTGRES_PASSWORD", env.Password)
	}

	_, ok = os.LookupEnv("POSTGRES_PORT")
	if !ok {
		os.Setenv("POSTGRES_PORT", env.Port)
	}

	_, ok = os.LookupEnv("POSTGRES_SSL")
	if !ok {
		os.Setenv("POSTGRES_SSL", env.SslMode)
	}

	_, ok = os.LookupEnv("POSTGRES_USER")
	if !ok {
		os.Setenv("POSTGRES_USER", env.User)
	}
}

func ConnectDB(host string, port string, user string, password string, dbname string, sslMode string) (db *sql.DB, err error) {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslMode)

	log.Printf("conn string: " + psqlInfo)

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
		fmt.Printf("Cannot read env file: %s", err)
	}

	var envData PostgreServerConn
	err = json.Unmarshal(data, &envData)
	if err != nil {
		fmt.Printf("There was an error decoding the json. err = %s", err)
	}

	return envData
}
