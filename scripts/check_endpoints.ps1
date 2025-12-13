$s = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\products.csv'
Write-Host '--- CSV (primeras 20 líneas) ---'
Get-Content -Path $s -TotalCount 20
$pid = (Import-Csv -Path $s | Select-Object -First 1).productId
Write-Host '--- primer productId:' $pid

Write-Host '--- GET /api/products?limit=1 ---'
try {
    $r = Invoke-RestMethod -Uri 'https://lalfashion.co/api/products?limit=1' -Method Get -Headers @{ 'Accept' = 'application/json' } -TimeoutSec 15
    if ($r) { $r | ConvertTo-Json -Depth 2 | Write-Host }
} catch {
    Write-Host 'GET /api/products falló:' $_.Exception.Message
}

if ($pid) {
    Write-Host '--- GET /api/products/{id} ---'
    try {
        $r = Invoke-RestMethod -Uri ("https://lalfashion.co/api/products/$pid") -Method Get -Headers @{ 'Accept' = 'application/json' } -TimeoutSec 15
        if ($r) { $r | ConvertTo-Json -Depth 2 | Write-Host }
    } catch {
        Write-Host 'GET /api/products/{id} falló:' $_.Exception.Message
    }
} else {
    Write-Host 'No se encontró productId en el CSV.'
}