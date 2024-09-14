package main
import (
    "bufio"
    "fmt"
	"log"
    "os"
)

func main() {
	file, err := os.Open("JMDict_e")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
        fmt.Println(scanner.Text())

    }


}

func initScanner(scanner) {

}

func skipToNextEntry(scanner) {

}

func entryContainsKanji(kanji) {

}

// Return obj containing vocab, readings, and gloss entries
func getEntryData() {

}

// Return array with all kanji in a given vocab
func findAllKanji(vocab) {
	
}

func uploadToKanjiDb(vocab, readings, glosses) {
	// GET kanji id from DB for each kanji in the word

	// INSERT new word entry, get new ID

	// Update many to many reference table for vocabId to each kanjiId
}