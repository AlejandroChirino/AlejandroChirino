# run_jmeter.ps1
# Lanza JMeter en modo non-GUI, escribe PID, hace tail de jmeter.log y abre el reporte cuando termina.

Param(
    [string]$JMeterPath = '',
    [string]$TestPlan = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\testplan.jmx',
    [string]$Results = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\results.jtl',
    [string]$ReportDir = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\report',
    [string]$ProductsCsv = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\products.csv',
    [switch]$VerboseDiscovery
)

# Valores por defecto (se pueden sobreescribir con los parámetros)
$jm = $null
$test = $TestPlan
$results = $Results
$reportDir = $ReportDir
$pidFile = Join-Path (Split-Path -Parent $results) 'jmeter.pid'
$jmeterRunLog = Join-Path (Split-Path -Parent $results) 'jmeter_run.log'

# Función para localizar jmeter.bat en ubicaciones comunes
function Find-JMeter {
    # 1) JMETER_HOME
    if ($Env:JMETER_HOME) {
        $candidate = Join-Path $Env:JMETER_HOME 'bin\jmeter.bat'
        if (Test-Path $candidate) { return $candidate }
    }

    # 2) Buscar en Downloads del usuario actual carpetas apache-jmeter*
    $dl = Join-Path $Env:USERPROFILE 'Downloads'
    if (Test-Path $dl) {
        try {
            $dirs = Get-ChildItem -Path $dl -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like 'apache-jmeter*' }
            foreach ($d in $dirs) {
                $cand = Join-Path $d.FullName 'bin\jmeter.bat'
                if (Test-Path $cand) { return $cand }
            }
        } catch {}
    }

    # 3) Rutas comunes
    $possible = @(
        "C:\\Program Files\\apache-jmeter-5.6.3\\bin\\jmeter.bat",
        "C:\\apache-jmeter-5.6.3\\bin\\jmeter.bat",
        "C:\\Users\\$($Env:USERNAME)\\Downloads\\apache-jmeter-5.6.3\\bin\\jmeter.bat"
    )
    foreach ($p in $possible) { if (Test-Path $p) { return $p } }

    return $null
}

# Si el usuario pasó una ruta, úsala; si no, intenta localizar JMeter automáticamente
if ($JMeterPath -and $JMeterPath.Trim() -ne '') {
    $jm = $JMeterPath
} else {
    $jm = Find-JMeter
}

if ($VerboseDiscovery) { Write-Host "JMeter candidate: $jm" }

function Fail([string]$msg) {
    Write-Error $msg
    exit 1
}

if (-not (Test-Path $jm)) {
    # Intentar localizar jmeter.bat debajo de la carpeta padre (búsqueda recursiva rápida)
    $parent = Split-Path -Parent $jm
    if (Test-Path $parent) {
        Write-Warning "Ruta $jm no encontrada; buscando jmeter.bat dentro de $parent (búsqueda recursiva, puede tardar)..."
        try {
            $found = Get-ChildItem -Path $parent -Filter 'jmeter.bat' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) { $jm = $found.FullName; Write-Host "Encontrado jmeter.bat: $jm" }
        } catch {
            Write-Warning "Búsqueda en $parent falló: $_"
        }
    }

    # Si no se encontró, intentar buscar en Downloads
    if (-not (Test-Path $jm)) {
        $dl = Join-Path $Env:USERPROFILE 'Downloads'
        if (Test-Path $dl) {
            Write-Warning "Buscando jmeter.bat en Downloads de usuario..."
            try {
                $found = Get-ChildItem -Path $dl -Filter 'jmeter.bat' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($found) { $jm = $found.FullName; Write-Host "Encontrado jmeter.bat en Downloads: $jm" }
            } catch {
                Write-Warning "Búsqueda en Downloads falló: $_"
            }
        }
    }

    if (-not (Test-Path $jm)) { Fail "No se encontró jmeter.bat en la ruta especificada ni en búsquedas automáticas. Especifica -JMeterPath con la ruta correcta." }
}
if (-not (Test-Path $test)) { Fail "No se encontró el testplan en: $test" }

# Intentar resolver la ruta 8.3 (short path) para evitar errores con paréntesis/espacios
function Get-ShortPath([string]$path) {
    # Intentar con COM Scripting.FileSystemObject (funciona en PowerShell 5.1)
    try {
        $fso = New-Object -ComObject Scripting.FileSystemObject
        if ($fso) {
            if ($fso.FileExists($path)) {
                return $fso.GetFile($path).ShortPath
            } elseif ($fso.FolderExists($path)) {
                return $fso.GetFolder($path).ShortPath
            }
        }
    } catch {
        # Si falla, no intentar construcciones con cmd.exe (evita errores de parseo)
    }

    return $null
}

$short = Get-ShortPath $jm
if ($short) {
    if (Test-Path $short) {
        Write-Host "Usando ruta 8.3 para JMeter: $short"
        $jm = $short
    } else {
        Write-Warning "Ruta 8.3 obtenida pero no encontrada en disco: $short; usando ruta original: $jm"
    }
} else {
    Write-Warning "No se pudo resolver ruta 8.3 para: $jm. Si hay paréntesis en la ruta, considere mover JMeter a una carpeta sin paréntesis."
}

# Limpiar directorio de reporte si existe
if (Test-Path $reportDir) {
    Write-Host "Eliminando directorio de reporte existente: $reportDir"
    Remove-Item -Recurse -Force $reportDir
}
# Eliminar log previo si existe
if (Test-Path $jmeterRunLog) { Remove-Item -Force $jmeterRunLog }

$argList = @('-n','-t',$test,'-l',$results,'-j',$jmeterRunLog,'-e','-o',$reportDir)

Write-Host "Iniciando JMeter en background (Start-Process directo a jmeter.bat)..."
try {
    $jmeterBin = Split-Path -Parent $jm
    # Usar ArgumentList como array para evitar problemas de parseo de una sola cadena
    $proc = Start-Process -FilePath $jm -ArgumentList $argList -WorkingDirectory $jmeterBin -PassThru
} catch {
    Fail "Fallo al iniciar JMeter directamente: $_"
}

# Guardar PID
if ($proc -and $proc.Id) {
    $proc.Id | Out-File -FilePath $pidFile -Encoding ascii
    Write-Host "JMeter iniciado con PID $($proc.Id). PID guardado en: $pidFile"
} else {
    Write-Warning "No se obtuvo PID del proceso; es posible que JMeter no haya arrancado correctamente."
}

# Localizar jmeter.log
$jmeterBin = Split-Path -Parent $jm
$jmeterLog = Join-Path $jmeterBin 'jmeter.log'
$tailJob = $null
if (Test-Path $jmeterLog) {
    Write-Host "Mostrando últimas líneas de $jmeterLog (CTRL+C para dejar de ver, el job seguirá ejecutando):"
    $tailJob = Start-Job -ScriptBlock { param($p) Get-Content -Path $p -Wait -Tail 20 } -ArgumentList $jmeterLog
}

# Esperar a que termine el proceso
if ($proc -and $proc.Id) {
    try {
        Wait-Process -Id $proc.Id
    } catch {
        Write-Warning "Wait-Process terminó con error o el proceso ya no existe: $_"
    }
    Write-Host "JMeter (PID $($proc.Id)) ha finalizado."
} else {
    Write-Warning "No hay PID para esperar; comprobando si hay procesos java activos que parezcan JMeter..."
}

# Parar tail job y mostrar contenido final
if ($tailJob) {
    # Traer contenido acumulado y eliminar job
    Receive-Job -Job $tailJob -Keep | ForEach-Object { Write-Host $_ }
    try { Stop-Job -Job $tailJob | Out-Null } catch {}
    try { Remove-Job -Job $tailJob | Out-Null } catch {}
}

# Mostrar resultado y abrir reporte si existe
$index = Join-Path $reportDir 'index.html'
if (Test-Path $index) {
    Write-Host "Reporte generado en: $index -- abriendo en el navegador..."
    Start-Process $index
} elseif (Test-Path $results) {
    Write-Host "No se generó el reporte HTML, pero hay resultados JTL en: $results"
    Write-Host "Puedes abrir el JTL en JMeter GUI o inspeccionarlo con Get-Content -Tail"
} else {
    Write-Warning "Ni reporte ni JTL encontrados. Revisa jmeter.log en: $jmeterLog"
}

Write-Host "Fin."
