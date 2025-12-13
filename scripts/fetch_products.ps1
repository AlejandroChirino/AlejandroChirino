$out = 'C:\Alejandro\La L Fashion\pagina web\la-fashion-setup\scripts\products.csv'
$base = 'https://lalfashion.co'
$limit = 100
$offset = 0

"productId" | Out-File -FilePath $out -Encoding utf8

while ($true) {
    $url = "$base/api/products?limit=$limit&offset=$offset"
    Write-Host "Fetching $url"
    try {
        $resp = Invoke-RestMethod -Uri $url -Method Get -Headers @{ 'Accept' = 'application/json' } -TimeoutSec 30
    } catch {
        Write-Host "Request failed: $_"
        break
    }

    if (-not $resp) { break }

    $items = @()
    if ($resp -is [System.Array]) { $items = $resp }
    elseif ($resp.data) { $items = $resp.data }
    elseif ($resp.items) { $items = $resp.items }
    else { $items = @($resp) }

    if (-not $items -or $items.Count -eq 0) { break }

    foreach ($it in $items) {
        $id = $null
        if ($it.id) { $id = $it.id }
        elseif ($it.productId) { $id = $it.productId }
        elseif ($it.product_id) { $id = $it.product_id }
        if ($id) { $id | Out-File -FilePath $out -Append -Encoding utf8 }
    }

    if ($items.Count -lt $limit) { break }
    $offset += $limit
}

Write-Host "Done. CSV at $out"
