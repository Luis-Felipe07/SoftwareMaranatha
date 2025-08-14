@echo off
setlocal enabledelayedexpansion

echo =========================================
echo PRUEBAS AUTOMATIZADAS - RESTAURANTE MARANATHA
echo =========================================
echo.
echo Fecha: %date% %time%
echo.

REM 
color 0A

REM 
if not exist pom.xml (
    echo ERROR: No se encontro pom.xml
    echo Asegurate de ejecutar este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Verificar Maven
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Maven no esta instalado o no esta en el PATH
    echo Por favor instala Maven desde: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

REM Verificar Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Java no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

echo Versiones detectadas:
call mvn -v | findstr "Apache Maven"
call java -version 2>&1 | findstr "version"
echo.

REM Crear directorio para reportes si no existe
if not exist "test-reports" mkdir test-reports

REM Limpiar y compilar
echo =========================================
echo 1. LIMPIANDO Y COMPILANDO EL PROYECTO...
echo =========================================
call mvn clean compile
if %errorlevel% neq 0 (
    echo ERROR: Fallo la compilacion
    pause
    exit /b 1
)

REM Ejecutar pruebas unitarias
echo.
echo =========================================
echo 2. EJECUTANDO PRUEBAS UNITARIAS...
echo =========================================
call mvn test -Dtest="**/unit/**" -DfailIfNoTests=false
set UNIT_RESULT=%errorlevel%

REM Ejecutar pruebas de integracion
echo.
echo =========================================
echo 3. EJECUTANDO PRUEBAS DE INTEGRACION...
echo =========================================
call mvn test -Dtest="**/integration/**" -DfailIfNoTests=false
set INTEGRATION_RESULT=%errorlevel%

REM Iniciar aplicacion para pruebas E2E
echo.
echo =========================================
echo 4. INICIANDO APLICACION PARA PRUEBAS E2E...
echo =========================================
echo Iniciando servidor en puerto 8080...
start /b cmd /c "mvn spring-boot:run -Dspring-boot.run.profiles=test > test-reports\app-log.txt 2>&1"

REM Esperar a que la aplicacion inicie
echo Esperando 30 segundos para que inicie la aplicacion...
for /l %%i in (30,-1,1) do (
    echo Esperando %%i segundos...
    ping -n 2 127.0.0.1 >nul
)

REM Verificar que la aplicacion este corriendo
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: La aplicacion podria no estar corriendo correctamente
)

REM Ejecutar pruebas E2E
echo.
echo =========================================
echo 5. EJECUTANDO PRUEBAS E2E...
echo =========================================
call mvn test -Dtest="**/e2e/**" -DfailIfNoTests=false
set E2E_RESULT=%errorlevel%

REM Detener la aplicacion
echo.
echo Deteniendo la aplicacion...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Generar reporte de cobertura
echo.
echo =========================================
echo 6. GENERANDO REPORTE DE COBERTURA...
echo =========================================
call mvn jacoco:report

REM Copiar reportes a carpeta consolidada
echo.
echo Copiando reportes...
xcopy /s /y "target\surefire-reports\*" "test-reports\surefire\" >nul 2>&1
xcopy /s /y "target\site\jacoco\*" "test-reports\jacoco\" >nul 2>&1

REM Mostrar resumen de resultados
echo.
echo =========================================
echo RESUMEN DE PRUEBAS
echo =========================================
echo.

if %UNIT_RESULT%==0 (
    echo [EXITOSO] Pruebas Unitarias
) else (
    echo [FALLO] Pruebas Unitarias
)

if %INTEGRATION_RESULT%==0 (
    echo [EXITOSO] Pruebas de Integracion
) else (
    echo [FALLO] Pruebas de Integracion
)

if %E2E_RESULT%==0 (
    echo [EXITOSO] Pruebas E2E
) else (
    echo [FALLO] Pruebas E2E
)

echo.
echo =========================================
echo PRUEBAS COMPLETADAS
echo =========================================
echo.
echo Reportes disponibles en:
echo - test-reports\surefire\ (Reportes de pruebas)
echo - test-reports\jacoco\ (Cobertura de codigo)
echo - test-reports\app-log.txt (Log de la aplicacion)
echo.

REM Preguntar si abrir el reporte
set /p ABRIR_REPORTE="Desea abrir el reporte de cobertura en el navegador? (S/N): "
if /i "%ABRIR_REPORTE%"=="S" (
    start "" "test-reports\jacoco\index.html"
)

echo.
echo Presione cualquier tecla para salir...
pause >nul