set GOOS=linux
set GOARCH=amd64
set CGO_ENABLED=0
go build -o bootstrap src/KanjiServer.go
%USERPROFILE%\Go\bin\build-lambda-zip.exe -o Kanji-Server.zip bootstrap