set GOOS=linux
set GOARCH=amd64
set CGO_ENABLED=0

go build -o bootstrap src/KanjiServer.go
%USERPROFILE%\Go\bin\build-lambda-zip.exe -o KanjiServer.zip bootstrap
go build -o bootstrap src/DailyTask/DailyTask.go
%USERPROFILE%\Go\bin\build-lambda-zip.exe -o DailyTask.zip bootstrap
del .\bootstrap
npm run build --prefix kanjijitsu-ui
:: Windows command line has no method to append files to zip; 7-zip exe thinks the folder is invalid; So the React build must be manually added to the repo until a solution is found
:: Linux users should be able to use a `zip` command as normal here, but I am on windows.