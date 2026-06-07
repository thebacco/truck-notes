@echo off
setlocal

cd /d "%~dp0"

set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

where node >nul 2>nul
if %errorlevel%==0 (
  node serve.mjs
  goto :done
)

if exist "%CODEX_NODE%" (
  "%CODEX_NODE%" serve.mjs
  goto :done
)

echo Could not find Node.js.
echo.
echo Install Node.js LTS from https://nodejs.org/
echo Then re-open this file.
echo.
pause

:done
endlocal
