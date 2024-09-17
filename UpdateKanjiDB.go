package main

import (
	"bufio"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
)

const entryCloseTag = "</entry>"
const vocabTag = "<keb>"
const readingTag = "<reb>"
const glossTag = "<gloss>"
const priTag = "<ke_pri>"
const fileName = "JMDict_e"

const KanjiFileNames = "JLPT Kanji/N"

const VocabInsertSQL = `
	with s as (
		select id, vocab 
		from vocab
		where vocab = $1
	), i as (
		insert into vocab ("vocab", "common")
		select $1, $2
		where not exists (select 1 from s)
		returning id
	), kanjiTable as ( 
		select id, kanji as kanjiChara
		from kanji 
		where kanji.kanji=$3
	), relationTable as (
		select kanji_id, vocab_id from
		(select id as vocab_id
		from i
		union all
		select id
		from s ) vocabTable
		cross join 
		(select id as kanji_id from kanjiTable) kanjiTable
	), z as (
	insert into kanji_vocab (kanji_id, vocab_id)
	select kanji_id, vocab_id from relationTable
	where not exists( 
		select 1 from relationTable inner join kanji_vocab on 
		relationTable.kanji_id =  kanji_vocab.kanji_id and 
		relationTable.vocab_id =  kanji_vocab.vocab_id)
		returning *
	) select vocab_id from relationTable
`

const GlossInsertSQL = `
	insert into gloss (vocab_id, gloss)
	values
`

const ReadingInsertSQL = `
	insert into reading (vocab_id, gloss)
	values
`
const ReadingInsertSQLLine = `
	($1, $2)
`

type Vocab struct {
	Vocab    string
	Common   bool
	Readings []string
	Gloss    []string
}

func UpdateKanjiVocab(db *sql.DB, kanji string) {
	vocabList := findVocabForKanji(kanji)
	fmt.Println(vocabList)
	fmt.Println(kanji + " is our target")
	for _, vocab := range vocabList {
		uploadVocabToDb(db, kanji, vocab)
	}
}

func findVocabForKanji(kanji string) []Vocab {
	file, err := os.Open(fileName)
	if err != nil {
		log.Fatal(err)
	}

	scanner := bufio.NewScanner(file)

	vocabList := []Vocab{}

	for findNextVocab(scanner, kanji) {
		newVocab, error := getEntryData(scanner)
		if error == nil {
			vocabList = append(vocabList, newVocab)
		}
	}
	return vocabList
}

func parseTagText(text string) string {
	noStartTag := strings.Split(text, ">")[1]
	noEndTag := strings.Split(noStartTag, "<")[0]
	return noEndTag
}

func findNextVocab(scanner *bufio.Scanner, kanji string) bool {
	for scanner.Scan() {
		if strings.HasPrefix(scanner.Text(), vocabTag) && strings.Contains(scanner.Text(), kanji) {
			return true
		}
	}
	return false // End of file
}

func entryContainsKanji(kanji string) {

}

// Return obj containing vocab, readings, and gloss entries Expects scanner to be on current vocab text
func getEntryData(scanner *bufio.Scanner) (Vocab, error) {
	newVocabtext := parseTagText(scanner.Text())

	newVocab := Vocab{Vocab: newVocabtext, Readings: []string{}, Gloss: []string{}}

	for scanner.Scan() {
		text := scanner.Text()
		if strings.HasPrefix(text, readingTag) {
			newVocab.Readings = append(newVocab.Readings, parseTagText(text))
		}
		if strings.HasPrefix(text, glossTag) {
			newVocab.Gloss = append(newVocab.Gloss, parseTagText(text))
		}
		if strings.HasPrefix(text, priTag) {
			newVocab.Common = true
		}

		if strings.HasPrefix(text, entryCloseTag) {
			if len(newVocab.Readings) > 0 && len(newVocab.Gloss) > 0 {
				return newVocab, nil
			} else {
				return newVocab, errors.New("no readings")
			}
		}
	}

	return newVocab, errors.New("no readings")
}

// Return array with all kanji in a given vocab
// TODO : Not currently using, as the site works if we only link today's kanji
func findAllKanji(vocab string) []string {

	r := regexp.MustCompile(`[一-龯]`)
	matches := r.FindAllString(vocab, -1)
	return matches
}

func uploadVocabToDb(db *sql.DB, kanji string, vocab Vocab) {
	rows, err := db.Query(VocabInsertSQL, vocab.Vocab, vocab.Common, kanji)
	if err != nil {
		fmt.Println(err)
	}

	rows.Next()

	var vocab_id int
	if err := rows.Scan(&vocab_id); err != nil {
		fmt.Println(err)
	}
	rows.Close()

	//GLOSSES
	var glossSB strings.Builder
	glossSB.WriteString(GlossInsertSQL)
	for glossIndex := range vocab.Gloss {
		glossSB.WriteString("($1, $" + strconv.Itoa(glossIndex+1) + ")")
	}

	glossInterface := make([]interface{}, len(vocab.Gloss)+1)
	glossInterface[0] = vocab_id
	for i := range len(vocab.Gloss) {
		glossInterface[i+1] = vocab.Gloss[i]
	}

	_, err = db.Exec(glossSB.String(), glossInterface...)
	if err != nil {
		fmt.Println(err)
	}

	//READINGS
	var readSB strings.Builder
	readSB.WriteString(ReadingInsertSQL)
	for readIndex := range vocab.Readings {
		readSB.WriteString("($1, $" + strconv.Itoa(readIndex+1) + ")")
	}

	readInterface := make([]interface{}, len(vocab.Readings)+1)
	readInterface[0] = vocab_id
	for i := range len(vocab.Readings) {
		readInterface[i+1] = vocab.Readings[i]
	}

	_, err = db.Exec(readSB.String(), readInterface...)
	if err != nil {
		fmt.Println(err)
	}
}

// Insert all kanji into the kanji table
func populateKanjiTable(db *sql.DB) {
	var sb strings.Builder
	sb.WriteString("INSERT INTO kanji (kanji, nlevel) VALUES ")
	first := true

	for i := 1; i <= 5; i++ {
		file, err := os.Open(KanjiFileNames + strconv.Itoa(i))
		if err != nil {
			log.Fatal(err)
		}

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			newKanji := scanner.Text()
			if !first {
				sb.WriteString(", ('" + newKanji + "', " + strconv.Itoa(i) + ")")
			} else {
				first = false
				sb.WriteString("('" + newKanji + "', " + strconv.Itoa(i) + ") ")
			}
		}
	}
	sb.WriteString(";")
	fmt.Println(sb.String())

	_, err := db.Exec(sb.String())
	if err != nil {
		fmt.Println(err)
	}
}
