package main

import (
	"bufio"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"
	"slices"
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

const SafeGlossInsertSQL = `
	insert into gloss (vocab_id, gloss)
	select $1, $2
	where not exists ( select 1 from gloss where vocab_id = $1 and gloss = $3)
`

const SafeReadingInsertSQL = `
	insert into reading (vocab_id, reading)
	select $1, $2
	where not exists ( select 1 from reading where vocab_id = $1 and reading = $3)
`

const ReadingInsertSQLLine = `
	($1, $2)
`

type Vocab struct {
	Vocab_id int
	Vocab    string
	Common   bool
	Readings []string
	Gloss    []string
}

func UpdateKanjiVocab(db *sql.DB, kanji string) {
	vocabList := findVocabForKanji(kanji)
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

// Return obj containing vocab, readings, and gloss entries. Expects scanner to be on current vocab text
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

// Uploads a single vocab to the DB, assigning it to the kanji and saving all readings and glosses.
func uploadVocabToDb(db *sql.DB, kanji string, vocab Vocab) {

	// Vocab and relation to Kanji
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

	// Glosses
	for _, glossEntry := range vocab.Gloss {
		_, err = db.Exec(SafeGlossInsertSQL, vocab_id, glossEntry, glossEntry)
		if err != nil {
			fmt.Println(err)
			fmt.Println(strconv.Itoa(vocab_id))
			fmt.Println(glossEntry)
		}
	}

	// Readings
	for _, readEntry := range vocab.Readings {
		_, err = db.Exec(SafeReadingInsertSQL, vocab_id, readEntry, readEntry)
		if err != nil {
			fmt.Println(err)
			fmt.Println(strconv.Itoa(vocab_id))
			fmt.Println(readEntry)
		}
	}
}

// Insert every single kanji into the kanji table
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
			if first {
				first = false
				sb.WriteString("('" + newKanji + "', " + strconv.Itoa(i) + ") ")
			} else {
				sb.WriteString(", ('" + newKanji + "', " + strconv.Itoa(i) + ")")
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

const selectKanjiVocabSQL = `select kanji.id as kanji_id, vocab.vocab, vocab.id as vocab_id, vocab.common from kanji
inner join kanji_vocab on kanji.id = kanji_vocab.kanji_id 
inner join vocab on kanji_vocab.vocab_id = vocab.id 
where kanji.kanji  = $1`

const selectGlossSQL = `select vocab.id as vocab_id, gloss from kanji
inner join kanji_vocab on kanji.id = kanji_vocab.kanji_id 
inner join vocab on kanji_vocab.vocab_id = vocab.id 
inner join gloss on vocab.id = gloss.vocab_id 
where kanji.id = $1`

const selectReadingSQL = `select vocab.id as vocab_id, reading from kanji
inner join kanji_vocab on kanji.id = kanji_vocab.kanji_id 
inner join vocab on kanji_vocab.vocab_id = vocab.id 
inner join reading on vocab.id = reading.vocab_id 
where kanji.id = $1`

type KanjiOfDay struct {
	Kanji           string
	kanji_id        int
	VocabCollection []Vocab
}

// Returns an object including all vocabs of a kanji for parsing to json and sending to UI
func getKanjiOfDayObj(db *sql.DB, kanji string) KanjiOfDay {
	// Get the core vocab data
	rows, err := db.Query(selectKanjiVocabSQL, kanji)
	if err != nil {
		fmt.Println(err)
	}

	kanjiOfday := KanjiOfDay{Kanji: kanji}
	var kanji_id int

	for rows.Next() {
		var (
			vocab    string
			vocab_id int
			common   bool
		)
		if err := rows.Scan(&kanji_id, &vocab, &vocab_id, &common); err != nil {
			log.Fatal(err)
		}

		newVocab := Vocab{Vocab: vocab, Vocab_id: vocab_id, Common: common, Gloss: []string{}, Readings: []string{}}
		kanjiOfday.VocabCollection = append(kanjiOfday.VocabCollection, newVocab)
	}
	kanjiOfday.kanji_id = kanji_id
	rows.Close()

	// Get the glosses and append them into the matching vocab datas
	glossRows, err := db.Query(selectGlossSQL, kanji_id)
	if err != nil {
		fmt.Println(err)
	}

	for glossRows.Next() {
		var (
			vocab_id int
			gloss    string
		)
		if err := glossRows.Scan(&vocab_id, &gloss); err != nil {
			log.Fatal(err)
		}

		matchingVocabEntryIndex := slices.IndexFunc(kanjiOfday.VocabCollection, func(n Vocab) bool {
			return n.Vocab_id == vocab_id
		})
		kanjiOfday.VocabCollection[matchingVocabEntryIndex].Gloss = append(kanjiOfday.VocabCollection[matchingVocabEntryIndex].Gloss, gloss)
	}
	glossRows.Close()

	// Get the readings and append them into the matching vocab datas
	readRows, err := db.Query(selectReadingSQL, kanji_id)
	if err != nil {
		fmt.Println(err)
	}

	for readRows.Next() {
		var (
			vocab_id int
			reading  string
		)
		if err := readRows.Scan(&vocab_id, &reading); err != nil {
			log.Fatal(err)
		}

		matchingVocabEntryIndex := slices.IndexFunc(kanjiOfday.VocabCollection, func(n Vocab) bool {
			return n.Vocab_id == vocab_id
		})
		kanjiOfday.VocabCollection[matchingVocabEntryIndex].Readings = append(kanjiOfday.VocabCollection[matchingVocabEntryIndex].Readings, reading)
	}
	readRows.Close()

	// We should now have a fully built kanji of day we can send as JSON!
	return kanjiOfday
}
