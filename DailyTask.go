package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"
)

// Should run every day to update the DB to select the new kanji of day
func DailyTask() {
	db, _ := PostgresConn.ConnectDBFromFile("env.json")
	KanjiDBLib.InitKanjiOfDay(db)
}
