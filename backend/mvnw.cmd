@REM Maven Wrapper startup batch script
@echo off
setlocal enabledelayedexpansion

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9"
set "MAVEN_ZIP=%MAVEN_HOME%\maven.zip"
set "DIST_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"

if not exist "%MAVEN_HOME%\apache-maven-3.9.9\bin\mvn.cmd" (
    echo Downloading Maven 3.9.9...
    if not exist "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DIST_URL%' -OutFile '%MAVEN_ZIP%'"
    if errorlevel 1 (
        echo Error: Failed to download Maven
        exit /b 1
    )
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_HOME%' -Force"
    if errorlevel 1 (
        echo Error: Failed to extract Maven
        exit /b 1
    )
    del "%MAVEN_ZIP%"
)

set "MAVEN_EXEC=%MAVEN_HOME%\apache-maven-3.9.9\bin\mvn.cmd"

if not exist "%MAVEN_EXEC%" (
    echo Error: Could not find mvn.cmd at %MAVEN_EXEC%
    exit /b 1
)

"%MAVEN_EXEC%" %*
