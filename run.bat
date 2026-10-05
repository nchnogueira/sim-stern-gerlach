@echo off
cd /d "%~dp0"
echo Iniciando o servidor web local...
start "Servidor da Simulacao" /MIN python -m http.server 8080

echo Aguardando o servidor iniciar...
timeout /t 2 > nul

echo Abrindo o navegador...
start http://localhost:8080
