@echo off
setlocal enabledelayedexpansion

cls

set CONFIG_FILE=config.yaml
set SCRIPT_DIR=%~dp0
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

:tool_read_yaml
set "keys=%~1"
set "yq_path=.%keys%"

where yq >nul 2>&1
if errorlevel 1 (
    echo Error: yq is not installed. Please install yq to use this script. >&2
    exit /b 1
)

if not exist "%SCRIPT_DIR%\%CONFIG_FILE%" (
    echo Error: Config file %SCRIPT_DIR%\%CONFIG_FILE% not found >&2
    exit /b 1
)

for /f "delims=" %%i in ('yq eval "%yq_path%" "%SCRIPT_DIR%\%CONFIG_FILE%" 2^>nul') do set "value=%%i"
if errorlevel 1 (
    echo Error: Failed to read YAML path: %yq_path% from %SCRIPT_DIR%\%CONFIG_FILE% >&2
    echo Available keys in config: >&2
    yq eval "keys" "%SCRIPT_DIR%\%CONFIG_FILE%" 2>nul >&2 || echo Could not read config file >&2
    exit /b 1
)

if "%value%"=="null" (
    echo Error: Key '%keys%' not found in config file >&2
    exit /b 1
)

echo %value%
exit /b 0

:get_output_redirect
call :tool_read_yaml "debug" 2>nul
if errorlevel 1 set "debug_mode=false"
if "%debug_mode%"=="true" (
    echo.
) else (
    echo ^> nul 2^>^&1
)
exit /b 0

:tool_replace_inplace
set "file_path=%~1"
set "search_string=%~2"
set "replace_string=%~3"

powershell -Command "(Get-Content '%file_path%') -replace '%search_string%', '%replace_string%' | Set-Content '%file_path%'"
exit /b 0

:tool_container_status
set "container_name=%~1"
for /f "delims=" %%i in ('docker ps -q --filter "name=%container_name%" 2^>nul') do set "container_status=%%i"
if defined container_status (
    echo [32m🏃 RUNNING[0m
) else (
    echo [31m🤚 STOPPED[0m
)
exit /b 0

:layer_build
set "folder=%~1"
cd /d "%SCRIPT_DIR%\layers\%folder%"
echo 🚀	Building %folder%
call :get_output_redirect
set "redirect=!output!"
docker compose up -d --build --force-recreate %redirect%
cd /d "%SCRIPT_DIR%"
exit /b 0

:service_destroy
set "service=%~1"
call :get_output_redirect
set "redirect=!output!"
echo 💣 Destroying %service%
call :service_stop "%service%" %redirect%
docker rm -f -v %service% %redirect%
exit /b 0

:service_start
set "service=%~1"
call :get_output_redirect
set "redirect=!output!"
echo 🏃 Starting %service%
docker start %service% %redirect%
exit /b 0

:service_stop
set "service=%~1"
call :get_output_redirect
set "redirect=!output!"
echo 🤚 Stopping %service%
docker stop %service% %redirect%
exit /b 0

:service_restart
set "service=%~1"
call :get_output_redirect
set "redirect=!output!"
echo 🔄 Restarting %service%
docker restart %service% %redirect%
exit /b 0

:create_network
call :get_output_redirect
set "redirect=!output!"
echo 🌍	Creating network
echo.
for /f "delims=" %%i in ('docker network inspect app-network --format="{{range .Containers}}{{.Name}} {{end}}" 2^>nul') do (
    for %%j in (%%i) do docker network disconnect -f app-network %%j %redirect%
)
docker network rm app-network %redirect%
docker network create app-network %redirect%
cd /d "%SCRIPT_DIR%"
exit /b 0

:init
call :get_output_redirect
set "redirect=!output!"
echo.
echo 💨	Initializing services
echo.
cd /d "%SCRIPT_DIR%\scripts\init"
uv venv %redirect%
call .venv\Scripts\activate.bat
uv pip install -r requirements.txt %redirect%
python script.py %redirect%
call deactivate
rmdir /s /q .venv
cd /d "%SCRIPT_DIR%"
exit /b 0

:env_create
echo 🛠️	Setting environment variables
echo.
copy .env layers\communication\.env >nul
copy .env layers\knowledge\.env >nul
copy .env layers\llm\.env >nul
copy .env layers\management\.env >nul
copy .env layers\sysml\.env >nul
copy .env scripts\init\.env >nul
copy .env scripts\seed\.env >nul
cd /d "%SCRIPT_DIR%"
exit /b 0

:clear
echo 🧹	Clearing build related files
echo.
if exist layers\communication\.env del layers\communication\.env
if exist layers\knowledge\.env del layers\knowledge\.env
if exist layers\llm\.env del layers\llm\.env
if exist layers\management\.env del layers\management\.env
if exist layers\sysml\.env del layers\sysml\.env
if exist scripts\init\.env del scripts\init\.env
if exist scripts\seed\.env del scripts\seed\.env
cd /d "%SCRIPT_DIR%"
exit /b 0

:lms_start
echo 🤖	Starting LLM Inference Engine
echo.
start /b xvfb-run -a .\exec\lms\lm-studio --no-sandbox >nul 2>&1
timeout /t 5 /nobreak >nul
start /b lms server start --cors >nul 2>&1
REM Load models here
REM lms load nomic-embed-text-v1.5.Q4_K_M.gguf -y --identifier embedding
start /b lms load nomic-embed-text-v1.5-GGUF -y --identifier embedding >nul 2>&1
start /b lms load Grok-3-reasoning-gemma3-12B-distilled-HF-GGUF -y --identifier main >nul 2>&1
exit /b 0

:lms_stop
start /b lms server stop >nul 2>&1
timeout /t 5 /nobreak >nul
taskkill /f /im lm-studio.exe >nul 2>&1
exit /b 0

REM Check if help argument is provided
if "%1"=="help" (
    echo Usage: llm-se [command]
    echo.
    echo Commands:
    echo   help            Show this help message
    echo   build           Build all services
    echo   seed            Seed sample data
    echo   start           Start all services
    echo   stop            Stop all services
    echo   restart         Restart all services
    echo   status          Show the status of all services
    echo   destroy         Destroy all services
    exit /b 0
)

if "%1"=="status" (
    echo Communication 	 App 			& call :tool_container_status "communication-app"
    echo.
    echo Management 	 API 			& call :tool_container_status "management-api"
    echo Management 	 Data 			& call :tool_container_status "management-data"
    echo Management 	 Logs 			& call :tool_container_status "management-logs"
    echo.
    echo LLM 		 API 			& call :tool_container_status "llm-api"
    echo LLM 		 Inference Engine 	& call :tool_container_status "llm-inference"
    echo LLM 		 Finetuning 		& call :tool_container_status "llm-finetuning"
    echo.
    echo Data 		 API 			& call :tool_container_status "knowledge-api"
    echo Data 		 Relational 		& call :tool_container_status "knowledge-relational"
    echo Data 		 Object 		& call :tool_container_status "knowledge-object"
    echo Data 		 Vector 		& call :tool_container_status "knowledge-vector"
    exit /b 0
)

if "%1"=="seed" (
    echo 🌱	Seeding sample knowledge
    echo.
    cd /d "%SCRIPT_DIR%\scripts\seed"
    uv venv
    call .venv\Scripts\activate.bat
    uv pip install -r requirements.txt
    python script.py
    call deactivate
    rmdir /s /q .venv
    cd /d "%SCRIPT_DIR%"
    exit /b 0
)

if "%1"=="build" (
    call :get_output_redirect
    set "redirect=!output!"
    set "tic=%time%"

    REM eval "docker rm $(docker ps -f status=exited -aq) $redirect"
    REM eval "docker rmi $(docker images -f "dangling=true" -q) $redirect"
    REM eval "docker volume rm $(docker volume ls -f "dangling=true" -q) $redirect"

    echo 🪜	Preparing to build
    echo.
    call :service_destroy "communication-app" %redirect%
    call :service_destroy "llm-inference" %redirect%
    call :service_destroy "llm-api" %redirect%
    call :service_destroy "llm-finetuning" %redirect%
    call :service_destroy "knowledge-relational" %redirect%
    call :service_destroy "knowledge-object" %redirect%
    call :service_destroy "knowledge-vector" %redirect%
    call :service_destroy "knowledge-api" %redirect%
    call :service_destroy "management-api" %redirect%
    call :service_destroy "management-data" %redirect%
    call :service_destroy "management-logs" %redirect%

    call :create_network
    call :env_create
    call :layer_build "knowledge"
    call :layer_build "llm"
    call :layer_build "communication"
    call :layer_build "management"
    call :layer_build "sysml"
    call :init
    
    REM Only start LM Studio in headless mode
    if "%2"=="headless" (
        call :lms_start
    )
    
    call :clear
    set "toc=%time%"
    echo ⌛️	Build completed
    echo 🎉	All services are running
    echo 🌐	Access the application at http://%LOCAL_IP%:3000
    echo.
    exit /b 0
)

if "%1"=="start" (
    call :lms_start
    call :service_start "communication-app"
    call :service_start "llm-inference"
    call :service_start "llm-api"
    call :service_start "llm-finetuning"
    call :service_start "knowledge-api"
    call :service_start "knowledge-relational"
    call :service_start "knowledge-object"
    call :service_start "knowledge-vector"
    call :service_start "management-api"
    call :service_start "management-data"
    call :service_start "management-logs"
    echo.
    echo 🎉 All services started
    echo.
    exit /b 0
)

if "%1"=="stop" (
    call :lms_stop
    call :service_stop "communication-app"
    call :service_stop "llm-inference"
    call :service_stop "llm-api"
    call :service_stop "llm-finetuning"
    call :service_stop "knowledge-api"
    call :service_stop "knowledge-relational"
    call :service_stop "knowledge-object"
    call :service_stop "knowledge-vector"
    call :service_stop "management-api"
    call :service_stop "management-data"
    call :service_stop "management-logs"
    echo.
    echo 🎉 All services stopped
    echo.
    exit /b 0
)

if "%1"=="restart" (
    call :service_restart "communication-app"
    call :service_restart "llm-inference"
    call :service_restart "llm-api"
    call :service_restart "llm-finetuning"
    call :service_restart "knowledge-api"
    call :service_restart "knowledge-relational"
    call :service_restart "knowledge-object"
    call :service_restart "knowledge-vector"
    call :service_restart "management-api"
    call :service_restart "management-data"
    call :service_restart "management-logs"
    echo.
    echo 🎉 All services restarted
    echo.
    exit /b 0
)

if "%1"=="destroy" (
    call :service_destroy "communication-app"
    call :service_destroy "llm-inference"
    call :service_destroy "llm-api"
    call :service_destroy "llm-finetuning"
    call :service_destroy "knowledge-api"
    call :service_destroy "knowledge-relational"
    call :service_destroy "knowledge-object"
    call :service_destroy "knowledge-vector"
    call :service_destroy "management-api"
    call :service_destroy "management-data"
    call :service_destroy "management-logs"
    echo.
    echo 🎉 All services destroyed
    echo.
    exit /b 0
)

if "%1"=="read" (
    call :tool_read_yaml "deployment.type"
    echo Test: %value%
    exit /b 0
)

endlocal
