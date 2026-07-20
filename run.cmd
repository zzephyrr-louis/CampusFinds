@echo off
setlocal EnableExtensions EnableDelayedExpansion

if /I "%~1"=="--backend-child" goto backend_child
if /I "%~1"=="--frontend-child" goto frontend_child

pushd "%~dp0" >nul || (
  echo CampusFind could not open its repository directory.
  exit /b 1
)

set "CAMPUSFIND_ROOT=%CD%"
set "CLIENT_DIR=%CAMPUSFIND_ROOT%\client"
set "BACKEND_DIR=%CAMPUSFIND_ROOT%\springboot-backend"
set "LOG_DIR=%CAMPUSFIND_ROOT%\logs"
set "BACKEND_LOG=%LOG_DIR%\backend.log"
set "FRONTEND_LOG=%LOG_DIR%\frontend.log"
set "BUILD_LOG=%LOG_DIR%\frontend-build.log"
set "FRONTEND_PROBE=%LOG_DIR%\frontend-probe.tmp"
set "BACKEND_URL=http://127.0.0.1:8080"
set "FRONTEND_URL=http://127.0.0.1:5173"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%" >nul 2>&1
if not exist "%LOG_DIR%" (
  echo CampusFind could not create the log directory:
  echo   %LOG_DIR%
  popd
  exit /b 1
)

call :require_command java.exe "Java 17 or newer"
if errorlevel 1 goto launcher_failed
set "JAVA_VERSION="
set "JAVA_MAJOR="
for /F "tokens=3" %%V in ('java.exe -version 2^>^&1 ^| findstr.exe /I "version"') do if not defined JAVA_VERSION set "JAVA_VERSION=%%~V"
for /F "tokens=1 delims=." %%M in ("!JAVA_VERSION!") do set "JAVA_MAJOR=%%M"
if not defined JAVA_MAJOR (
  echo CampusFind could not determine the installed Java version.
  goto launcher_failed
)
if !JAVA_MAJOR! LSS 17 (
  echo CampusFind requires Java 17 or newer; Java !JAVA_VERSION! is installed.
  goto launcher_failed
)
call :require_command node.exe "Node.js"
if errorlevel 1 goto launcher_failed
call :require_command npm.cmd "npm"
if errorlevel 1 goto launcher_failed
call :require_command curl.exe "curl"
if errorlevel 1 goto launcher_failed

if not exist "%BACKEND_DIR%\mvnw.cmd" (
  echo Missing Spring Boot Maven wrapper: %BACKEND_DIR%\mvnw.cmd
  goto launcher_failed
)
if not exist "%CLIENT_DIR%\package.json" (
  echo Missing React package manifest: %CLIENT_DIR%\package.json
  goto launcher_failed
)

echo.
echo [1/4] Preparing the React production build...
if not exist "%CLIENT_DIR%\node_modules\.bin\vite.cmd" (
  echo Installing locked frontend dependencies. This may take a few minutes...
  call npm.cmd --prefix "%CLIENT_DIR%" ci
  if errorlevel 1 (
    echo Frontend dependency installation failed.
    goto launcher_failed
  )
)

rem Vite reads this process variable before client/.env. The launcher always
rem builds the integrated application against the authoritative Spring API.
set "VITE_API_URL=%BACKEND_URL%/api"

>"%BUILD_LOG%" echo [%DATE% %TIME%] npm run build
call npm.cmd --prefix "%CLIENT_DIR%" run build >>"%BUILD_LOG%" 2>&1
if errorlevel 1 (
  echo React build failed. Recent output:
  call :show_log_tail "%BUILD_LOG%"
  goto launcher_failed
)
echo React build completed. Log: %BUILD_LOG%

echo.
echo [2/4] Checking the Spring Boot API on port 8080...
call :backend_ready
if not errorlevel 1 (
  echo Spring Boot is already ready at %BACKEND_URL%.
) else (
  call :port_in_use 8080
  if not errorlevel 1 (
    echo Port 8080 is occupied, but CampusFind health checks are not passing.
    echo Stop the process using port 8080, then run this launcher again.
    goto launcher_failed
  )

  >>"%BACKEND_LOG%" echo.
  >>"%BACKEND_LOG%" echo ===== CampusFind backend start: %DATE% %TIME% =====
  start "CampusFind API - port 8080" /min "%ComSpec%" /d /c ""%~f0" --backend-child"
  if errorlevel 1 (
    echo The Spring Boot process could not be started.
    goto launcher_failed
  )

  echo Waiting for Spring Boot and MySQL...
  call :wait_for_backend 120
  if errorlevel 1 (
    echo Spring Boot did not become ready within 120 seconds.
    echo Check that MySQL is running and the DB_* variables are correct.
    echo Recent backend output:
    call :show_log_tail "%BACKEND_LOG%"
    goto launcher_failed
  )
  echo Spring Boot is ready. Log: %BACKEND_LOG%
)

echo.
echo [3/4] Checking the built React server on port 5173...
call :frontend_ready
if not errorlevel 1 (
  echo The current CampusFind build is already served at %FRONTEND_URL%.
) else (
  call :port_in_use 5173
  if not errorlevel 1 (
    echo Port 5173 is occupied by another or outdated frontend process.
    echo Stop that process, then run this launcher again so the new build is used.
    goto launcher_failed
  )

  >>"%FRONTEND_LOG%" echo.
  >>"%FRONTEND_LOG%" echo ===== CampusFind frontend start: %DATE% %TIME% =====
  start "CampusFind Web - port 5173" /min "%ComSpec%" /d /c ""%~f0" --frontend-child"
  if errorlevel 1 (
    echo The built React server could not be started.
    goto launcher_failed
  )

  call :wait_for_frontend 30
  if errorlevel 1 (
    echo The built React server did not become ready within 30 seconds.
    echo Recent frontend output:
    call :show_log_tail "%FRONTEND_LOG%"
    goto launcher_failed
  )
  echo Built React server is ready. Log: %FRONTEND_LOG%
)

echo.
echo [4/4] CampusFind is ready.
echo   Web: %FRONTEND_URL%
echo   API: %BACKEND_URL%/api
echo   Logs: %LOG_DIR%
echo.
echo The API and web server run in separate minimized command windows.
echo Close those two windows to stop CampusFind.
start "" "%FRONTEND_URL%"

if exist "%FRONTEND_PROBE%" del /q "%FRONTEND_PROBE%" >nul 2>&1
popd
exit /b 0

:launcher_failed
echo.
echo CampusFind did not start. Fix the message above and run run.cmd again.
echo Logs are kept in: %LOG_DIR%
if exist "%FRONTEND_PROBE%" del /q "%FRONTEND_PROBE%" >nul 2>&1
if /I not "%CAMPUSFIND_NO_PAUSE%"=="1" pause
popd
exit /b 1

:require_command
where %~1 >nul 2>&1
if errorlevel 1 (
  echo Missing prerequisite: %~2 is not installed or is not on PATH.
  exit /b 1
)
exit /b 0

:backend_ready
curl.exe --silent --fail --max-time 2 "%BACKEND_URL%/api/health" >nul 2>&1
if errorlevel 1 exit /b 1
exit /b 0

:frontend_ready
curl.exe --silent --fail --max-time 2 --output "%FRONTEND_PROBE%" "%FRONTEND_URL%/" >nul 2>&1
if errorlevel 1 exit /b 1
fc.exe /b "%FRONTEND_PROBE%" "%CLIENT_DIR%\dist\index.html" >nul 2>&1
if errorlevel 1 exit /b 1
exit /b 0

:port_in_use
netstat.exe -ano -p TCP 2>nul | findstr.exe /R /C:":%~1 .*LISTENING" >nul 2>&1
if errorlevel 1 exit /b 1
exit /b 0

:wait_for_backend
for /L %%I in (1,1,%~1) do (
  call :backend_ready
  if not errorlevel 1 exit /b 0
  timeout.exe /t 1 /nobreak >nul
)
exit /b 1

:wait_for_frontend
for /L %%I in (1,1,%~1) do (
  call :frontend_ready
  if not errorlevel 1 exit /b 0
  timeout.exe /t 1 /nobreak >nul
)
exit /b 1

:show_log_tail
if not exist "%~1" (
  echo No log file was created.
  exit /b 0
)
powershell.exe -NoLogo -NoProfile -Command "Get-Content -LiteralPath '%~1' -Tail 60"
exit /b 0

:backend_child
pushd "%~dp0springboot-backend" >nul || exit /b 1
call mvnw.cmd spring-boot:run >>"%~dp0logs\backend.log" 2>&1
set "CHILD_EXIT=%errorlevel%"
if not "%CHILD_EXIT%"=="0" >>"%~dp0logs\backend.log" echo Spring Boot exited with code %CHILD_EXIT%.
popd
exit /b %CHILD_EXIT%

:frontend_child
pushd "%~dp0client" >nul || exit /b 1
call npm.cmd run serve >>"%~dp0logs\frontend.log" 2>&1
set "CHILD_EXIT=%errorlevel%"
if not "%CHILD_EXIT%"=="0" >>"%~dp0logs\frontend.log" echo React server exited with code %CHILD_EXIT%.
popd
exit /b %CHILD_EXIT%
