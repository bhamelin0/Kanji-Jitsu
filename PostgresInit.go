package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"

	_ "github.com/lib/pq"
)

func Init() {
	// Should run table to install all kanji from files
	db, _ := PostgresConn.ConnectDB("envAWS.json")
	KanjiDBLib.InitializeNewKanjiJitsuDB(db)
}
