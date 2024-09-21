package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"

	_ "github.com/lib/pq"
)

func Init() {
	// Should run table to install all kanji from files
	db := PostgresConn.ConnectDB()
	KanjiDBLib.PopulateKanjiTable(db)
}
