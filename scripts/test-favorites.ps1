<#
Simple PowerShell script to test the favorites API endpoints.

Usage examples:
  # Run with defaults (uses values we've been testing)
  pwsh .\scripts\test-favorites.ps1

  # Provide user and product ids explicitly
  pwsh .\scripts\test-favorites.ps1 -UserId "..." -ProductId "..." -BaseUrl "http://localhost:3000"

This script performs three calls in order:
  1) POST /api/favorites to create a favorite
  2) GET /api/favorites?userId=... to list favorites for the user
  3) DELETE /api/favorites?userId=...&productId=... to remove the favorite

It prints full response bodies and HTTP status details when available.
#>

param(
  [string]$UserId = "",
  [string]$ProductId = "112b7001-cc08-45f6-9da1-1f0863fb67d5",
  [string]$BaseUrl = "http://localhost:3000"
)

function Print-JsonSafe($obj){
  try { $obj | ConvertTo-Json -Depth 10 | Write-Host }
  catch { Write-Host $obj }
}

$ErrorActionPreference = 'Continue'

# We'll authenticate and sync the server cookie so RLS-protected inserts work.
$envFile = '.env'
$lines = Get-Content $envFile
$supabaseUrl = ($lines | Where-Object {$_ -match '^NEXT_PUBLIC_SUPABASE_URL='} | ForEach-Object {$_ -replace '^NEXT_PUBLIC_SUPABASE_URL=',''}).Trim()
$anon = ($lines | Where-Object {$_ -match '^NEXT_PUBLIC_SUPABASE_ANON_KEY='} | ForEach-Object {$_ -replace '^NEXT_PUBLIC_SUPABASE_ANON_KEY=',''}).Trim()

# Test credentials (adjust if needed)
$email = 'alejandrochirino131@gmail.com'
$pass = '12345678'

try {
  $auth = Invoke-RestMethod -Uri "${supabaseUrl}/auth/v1/token?grant_type=password" `
    -Method Post `
    -Headers @{ apikey = $anon; Authorization = "Bearer $anon" } `
    -Body (@{ email = $email; password = $pass } | ConvertTo-Json) `
    -ContentType 'application/json' -SessionVariable S -ErrorAction Stop
  Write-Host 'Authenticated OK'
} catch {
  Write-Host 'Auth failed:' $_.Exception.Message
  exit 1
}

try {
  $uri = [System.Uri]$supabaseUrl
  $projRef = $uri.Host.Split('.')[0]
  $tokenKey = "sb-$projRef-auth-token"
  $syncBodyObj = @{ key = $tokenKey; value = $auth }
  $syncBody = $syncBodyObj | ConvertTo-Json -Depth 10

  Invoke-RestMethod -Uri "$BaseUrl/api/auth/sync" -Method Post `
    -Body $syncBody -ContentType 'application/json' -WebSession $S -ErrorAction Stop
  Write-Host "Sync OK (key: $tokenKey)"
} catch {
  Write-Host 'Sync failed:' $_.Exception.Message
  exit 1
}

# If no UserId provided, use the authenticated user's id when possible
if (-not $UserId -and $auth -and $auth.user -and $auth.user.id) {
  $UserId = $auth.user.id
}

$headers = @{ 'Content-Type' = 'application/json' }
$payload = @{ userId = $UserId; productId = $ProductId } | ConvertTo-Json -Depth 10

Write-Host "== POST /api/favorites =="
try {
  $post = Invoke-RestMethod -Uri "$BaseUrl/api/favorites" -Method Post -Headers $headers -Body $payload -ContentType 'application/json' -WebSession $S -ErrorAction Stop
  Write-Host "POST result:"; Print-JsonSafe $post
} catch {
  Write-Host "POST error"
  if ($_.Exception.Response) {
    try {
      $status = $_.Exception.Response.StatusCode.Value__
      Write-Host "Status: $status"
      $body = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
      Write-Host "Body:"; Write-Host $body
    } catch { Write-Host $_ }
  } else { Write-Host $_ }
}

Write-Host "`n== GET /api/favorites?userId=... =="
try {
  $get = Invoke-RestMethod -Uri "$BaseUrl/api/favorites?userId=$UserId" -Method Get -WebSession $S -ErrorAction Stop
  Write-Host "GET result:"; Print-JsonSafe $get
} catch {
  Write-Host "GET error"
  if ($_.Exception.Response) {
    try {
      $status = $_.Exception.Response.StatusCode.Value__
      Write-Host "Status: $status"
      $body = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
      Write-Host "Body:"; Write-Host $body
    } catch { Write-Host $_ }
  } else { Write-Host $_ }
}

Write-Host "`n== DELETE /api/favorites?userId=...&productId=... =="
try {
  $del = Invoke-RestMethod -Uri "$BaseUrl/api/favorites?userId=$UserId&productId=$ProductId" -Method Delete -WebSession $S -ErrorAction Stop
  Write-Host "DELETE result:"; Print-JsonSafe $del
} catch {
  Write-Host "DELETE error"
  if ($_.Exception.Response) {
    try {
      $status = $_.Exception.Response.StatusCode.Value__
      Write-Host "Status: $status"
      $body = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
      Write-Host "Body:"; Write-Host $body
    } catch { Write-Host $_ }
  } else { Write-Host $_ }
}

Write-Host "`nDone."
