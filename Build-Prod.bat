set GOOS=linux
set GOARCH=amd64
set CGO_ENABLED=0
go build -o KanjiServer.exe src/KanjiServer.go
go build -o DailyTask.exe src/DailyTask/DailyTask.go
%USERPROFILE%\Go\bin\build-lambda-zip.exe -o KanjiServer.zip KanjiServer.exe
%USERPROFILE%\Go\bin\build-lambda-zip.exe -o DailyTask.zip DailyTask.exe
del .\DailyTask.exe
del .\KanjiServer.exe
