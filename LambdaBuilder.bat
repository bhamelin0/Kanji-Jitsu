set GOOS=linux
set GOARCH=amd64
set CGO_ENABLED=0
go build -o bootstrap Lambdatest\lambdatest.go
%USERPROFILE%\Go\bin\build-lambda-zip.exe -o lambda-handler.zip bootstrap