Param(
    [Parameter(Mandatory=$false)] [string]$Path = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\results.jtl',
    [int]$Top = 10,
    [string]$OutFile = ''
)

if (-not (Test-Path $Path)) {
    Write-Error "No se encontró el archivo JTL en: $Path"
    exit 2
}

Write-Host "Parsing JTL: $Path"

try {
    $csv = Import-Csv -Path $Path
} catch {
    Write-Error "Import-Csv falló: $_"
    exit 3
}

$total = $csv.Count
$success = ($csv | Where-Object { $_.success -eq 'true' }).Count
$failed = $total - $success

Write-Host "Total samples: $total`nSuccess: $success`nFailed: $failed`n"

Write-Host "Top Response Codes:"
$codes = $csv | Group-Object responseCode | Sort-Object Count -Descending
$codes | ForEach-Object { Write-Host ("{0} -> {1}" -f $_.Name, $_.Count) }

Write-Host "`nTop failed samplers by label:`n"
$failedByLabel = $csv | Where-Object { $_.success -ne 'true' } | Group-Object label | Sort-Object Count -Descending | Select-Object -First $Top
foreach ($g in $failedByLabel) {
    Write-Host ("{0} -> {1}" -f $g.Name, $g.Count)
}

Write-Host "`nExample failed samples (first $Top):`n"
$failedSamples = $csv | Where-Object { $_.success -ne 'true' } | Select-Object timeStamp,label,responseCode,responseMessage,failureMessage,URL,elapsed,threadName | Select-Object -First $Top
$failedSamples | Format-Table -AutoSize

if ($OutFile -ne '') {
    Write-Host "`nGuardando resumen en: $OutFile"
    $report = @()
    $report += "Total samples: $total"
    $report += "Success: $success"
    $report += "Failed: $failed"
    $report += "\nTop Response Codes:"
    $codes | ForEach-Object { $report += ("{0} -> {1}" -f $_.Name, $_.Count) }
    $report += "\nTop failed samplers by label:" 
    $failedByLabel | ForEach-Object { $report += ("{0} -> {1}" -f $_.Name, $_.Count) }
    $report += "\nExample failed samples:" 
    $failedSamples | ForEach-Object { $report += ($_ | ConvertTo-Csv -NoTypeInformation) }
    $report | Out-File -FilePath $OutFile -Encoding utf8
}

Write-Host "Hecho."
