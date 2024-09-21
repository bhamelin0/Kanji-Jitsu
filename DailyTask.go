package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"

	_ "github.com/lib/pq"
)

func DailyTask() {
	db := PostgresConn.ConnectDB()
	KanjiDBLib.InitKanjiOfDay(db)
}
