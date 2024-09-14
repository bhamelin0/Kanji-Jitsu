package main
import (
    "bufio"
	"errors"
    "fmt"
	"log"
    "os"
	"strings"
)

const entryCloseTag = "</entry>"
const vocabTag = "<keb>"
const readingTag = "<reb>"
const glossTag = "<gloss>"
const fileName = "JMDict_e"

type Vocab struct {
	Vocab string
	Readings []string
	Gloss	[]string
}

func main() {
	vocabList := findVocabForKanji("柔")

	fmt.Println(vocabList)
	fmt.Println(parseTagText("<keb>banana</keb>"))

	uploadToKanjiDb(vocabList)
}

func findVocabForKanji(kanji string) []Vocab {
	file, err := os.Open(fileName)
	if err != nil {
		log.Fatal(err)
	}

	scanner := bufio.NewScanner(file)

	vocabList := []Vocab{}
	
	for findNextVocab(scanner, "柔") {
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

	newVocab := Vocab { Vocab: newVocabtext, Readings: []string{}, Gloss: []string{} }

	for scanner.Scan() {
		text := scanner.Text()
		if strings.HasPrefix(text, readingTag) {
			newVocab.Readings = append(newVocab.Readings, parseTagText(text))
		}
		if strings.HasPrefix(text, glossTag) {
			newVocab.Gloss = append(newVocab.Gloss, parseTagText(text))
		}

		if strings.HasPrefix(text, entryCloseTag) {
			if len(newVocab.Readings) > 0 && len(newVocab.Gloss) > 0 {
				return newVocab, nil
			} else {
				return newVocab, errors.New("No readings")
			}
		}
	}

	return newVocab, errors.New("No readings")
}

// Return array with all kanji in a given vocab
func findAllKanji(vocab string) {
	
}

func uploadToKanjiDb(vocab string, readings []string, glosses []string) {
	// GET kanji id from DB for each kanji in the word

	// INSERT new word entry, get new ID

	// Update many to many reference table for vocabId to each kanjiId
}