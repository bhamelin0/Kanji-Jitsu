package main

import (
	"KanjiWordle/KanjiDBLib"
	"KanjiWordle/PostgresConn"

	_ "github.com/lib/pq"
)

func DailyTask() {
	db, _ := PostgresConn.ConnectDB("envAWS.json")
	KanjiDBLib.InitKanjiOfDay(db)
}
