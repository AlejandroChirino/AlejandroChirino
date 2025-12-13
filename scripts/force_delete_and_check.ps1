param(
  [Parameter(Mandatory=$true)][string]$ProductId,
  [string]$ApiUrl = "http://localhost:3000",
  [switch]$ShowSql
)

# Sanitize input
$cleanPid = $ProductId.Trim() -replace '^<|>$',''
if ($cleanPid -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') {
  Write-Error "ProductId inválido: $ProductId"
  exit 1
}

$deleteUrl = "$ApiUrl/api/admin/productos?ids=$cleanPid&force=true"
Write-Host "Calling: $deleteUrl"
try {
  $res = Invoke-RestMethod -Uri $deleteUrl -Method Delete -UseBasicParsing -ErrorAction Stop
  Write-Host "Response:`n" ($res | ConvertTo-Json -Depth 5)
} catch {
  Write-Error "Request failed: $_"
}

if ($ShowSql) {
  Write-Host "\nSQL to run in Supabase SQL editor to verify order_items snapshot (replace <PRODUCT_ID>):\n"
  $sql = @"
SELECT id, order_id, product_id, product_snapshot
FROM public.order_items
WHERE (product_snapshot->>'id') = '$cleanPid' OR product_id IS NULL
ORDER BY created_at DESC
LIMIT 50;
"@
  Write-Host $sql
}

Write-Host "Done. If you want to inspect DB rows, open Supabase SQL editor and run the SQL above."
