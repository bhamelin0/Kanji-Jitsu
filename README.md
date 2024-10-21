# Kanji Jitsu

Repository for [Kanji Jitsu](https://kanjijitsu.com).

Local:
Run backend + frontend: 
### `.\Dev-Start.bat`

Ensure an `env.JSON` file configuration points to a valid postgres server.

Backend notes:
Configure a script to run Init() against a postgres database to initialize the DB for kanji jitsu.

`DailyTask` is used to construct a lambda for rotating out the current set of Kanji in the database.

### GET /dailyKanji
Returns JSON representing the 5 kanji of the day, one at each level.

### GET /vocabForKanji?kanji={kanji}
Returns all vocab items related to a given kanji.

AWS:
### `.\Build-Prod.bat`
Builds the frontend, backend, and lambda zip files to be deployed.
