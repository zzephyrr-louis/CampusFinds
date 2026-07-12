@echo off
setlocal

pushd "%~dp0"

curl.exe --silent --fail --max-time 2 http://127.0.0.1:5173/ >nul 2>&1
if not errorlevel 1 (
  echo CampusFind is already running. Opening it now...
  start "" "http://127.0.0.1:5173/"
  popd
  exit /b 0
)

where node.exe >nul 2>&1
if errorlevel 1 (
  echo.
  echo CampusFind could not start because Node.js is not installed or is not on PATH.
  echo Install Node.js, reopen this window, and run this file again.
  echo.
  pause
  popd
  exit /b 1
)

where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo.
  echo CampusFind found Node.js, but npm.cmd is not available on PATH.
  echo Repair or reinstall Node.js, reopen this window, and run this file again.
  echo.
  pause
  popd
  exit /b 1
)

if not exist "client\node_modules\.bin\vite.cmd" (
  echo Installing CampusFind dependencies...
  call npm.cmd --prefix client install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    echo.
    pause
    popd
    exit /b 1
  )
)

echo.
echo Creating a clean, optimized CampusFind build...
echo.

call npm.cmd --prefix client run build
if errorlevel 1 (
  echo.
  echo CampusFind could not be built.
  echo.
  pause
  popd
  exit /b 1
)

echo.
echo Starting the completed app with Node.js at http://127.0.0.1:5173 ...
echo Vite is not used by the running server. Press Ctrl+C to stop it.
echo.

call npm.cmd --prefix client run serve -- --open
set "exit_code=%errorlevel%"

if not "%exit_code%"=="0" (
  echo.
  echo CampusFind stopped with an error. If port 5173 is already in use,
  echo close the other CampusFind window and run this file again.
  echo.
  pause
)

popd
exit /b %exit_code%
