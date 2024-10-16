package main

import (
	"KanjiWordle/src/KanjiDBLib"
	"KanjiWordle/src/PostgresConn"
)

func Init() {
	// Should run table to install all kanji from files
	db, _ := PostgresConn.ConnectDBFromFile("env.json")
	KanjiDBLib.InitializeNewKanjiJitsuDB(db)
}
