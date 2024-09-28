package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"
	"bufio"
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go/aws"
)

const InsertKanjiTableSQL = "INSERT INTO kanji (kanji, nlevel) VALUES "

func populateKanjiTableHelper(db *sql.DB, file *s3.GetObjectOutput, nLevel int) {
	var sb strings.Builder
	sb.WriteString(InsertKanjiTableSQL)
	first := true

	scanner := bufio.NewScanner(file.Body)
	for scanner.Scan() {
		newKanji := scanner.Text()
		if first {
			first = false
			sb.WriteString("('" + newKanji + "', " + strconv.Itoa(nLevel) + ") ")
		} else {
			sb.WriteString(", ('" + newKanji + "', " + strconv.Itoa(nLevel) + ")")
		}
	}
	sb.WriteString(";")
	fmt.Println(sb.String())

	_, err := db.Exec(sb.String())
	if err != nil {
		fmt.Println(err)
	}
}

func PrepareDatabase() {
	log.Printf("Default config")
	log.Print(os.Getenv("POSTGRES_HOST"))
	// Init the Postgres conn
	db, err := PostgresConn.ConnectDB(os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DBNAME"))
	if err != nil {
		log.Printf("Failed to connect to SQL: %v", err)
	}
	log.Printf("connected to postgres")
	KanjiDBLib.InitializeNewKanjiJitsuDB(db)

	log.Printf("DB Initializededed")
}

func PrepareS3() {
	// Load the SDK configuration
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Unable to load SDK config: %v", err)
	}

	// Initialize an S3 client
	svc := s3.NewFromConfig(cfg)
	log.Printf("SVC initted")

	output, err := svc.ListObjectsV2(context.TODO(),
		&s3.ListObjectsV2Input{
			Bucket: aws.String("kanji-jitsu-s3"),
		})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("All Objects in kanji-jitsu-s3 bucket")

	for _, object := range output.Contents {
		log.Printf("key=%s size=%d", object.Key, object.Size)
	}
	// log.Printf("Let's list up to %v buckets for your account.\n", 10)
	// _, err = svc.ListBuckets(context.TODO(), &s3.ListBucketsInput{})
	// if err != nil {
	// 	log.Printf("Couldn't list buckets for your account. Here's why: %v\n", err)
	// }

	// log.Printf(("we made it?"))

	// for i := 1; i <= 5; i++ {
	// 	// Define the bucket name as a variable so we can take its address
	// 	input := &s3.GetObjectInput{
	// 		Bucket: aws.String("kanji-jitsu-s3"),
	// 		Key:    aws.String("JLPT Kanji/N" + strconv.Itoa(i)),
	// 	}

	// 	log.Printf("created input obj")

	// 	//Get the file from the bucket
	// 	result, err := svc.GetObject(context.TODO(), input)
	// 	if err != nil {
	// 		log.Printf("Failed to list objects: %v", err)
	// 	}

	// 	log.Printf("We got the object!")

	// 	populateKanjiTableHelper(db, result, i)

	// 	log.Printf("Got result")
	// }
}

func LambdaHandler(ctx context.Context) (int, error) {
	//PrepareDatabase()
	PrepareS3()

	return 1, nil
}

func main() {
	lambda.Start(LambdaHandler)
}
