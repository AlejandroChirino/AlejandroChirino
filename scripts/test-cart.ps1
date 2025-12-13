# Test script: authenticate with Supabase, sync server cookie and POST to /api/cart
# Usage: from repo root run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; .\scripts\test-cart.ps1

$envFile = '.env'
$lines = Get-Content $envFile
$supabaseUrl = ($lines | Where-Object {$_ -match '^NEXT_PUBLIC_SUPABASE_URL='} | ForEach-Object {$_ -replace '^NEXT_PUBLIC_SUPABASE_URL=',''}).Trim()
$anon = ($lines | Where-Object {$_ -match '^NEXT_PUBLIC_SUPABASE_ANON_KEY='} | ForEach-Object {$_ -replace '^NEXT_PUBLIC_SUPABASE_ANON_KEY=',''}).Trim()

# Credenciales de prueba (proporcionadas por ti)
$email = 'alejandrochirino131@gmail.com'
$pass = '12345678'

Write-Host "Using Supabase URL: $supabaseUrl"

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
  # Derive the localStorage token key used by Supabase in the browser: sb-<projectRef>-auth-token
  $uri = [System.Uri]$supabaseUrl
  $projRef = $uri.Host.Split('.')[0]
  $tokenKey = "sb-$projRef-auth-token"

  # Send the full auth object as the cookie value so server-side client can reconstruct session
  $syncBodyObj = @{ key = $tokenKey; value = $auth } 
  $syncBody = $syncBodyObj | ConvertTo-Json -Depth 10

  Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/sync' -Method Post `
    -Body $syncBody -ContentType 'application/json' -WebSession $S -ErrorAction Stop
  Write-Host "Sync OK (key: $tokenKey)"
} catch {
  Write-Host 'Sync failed:' $_.Exception.Message
  exit 1
}

try {
  $payload = @{ productId = 'a44eb061-13e2-4e01-91d7-7ccf3c6b808b'; quantity = 1; size = 'Varias tallas'; color = 'Varios colores' } | ConvertTo-Json
  $res = Invoke-RestMethod -Uri 'http://localhost:3000/api/cart' -Method Post `
    -Body $payload -ContentType 'application/json' -WebSession $S -ErrorAction Stop
  Write-Host 'Cart POST response:'
  $res | ConvertTo-Json -Depth 10
} catch {
  Write-Host 'Cart POST failed'
  if ($_.Exception.Response) {
    try {
      $text = $_.Exception.Response.GetResponseStream()
      $sr = New-Object System.IO.StreamReader($text)
      $body = $sr.ReadToEnd()
      Write-Host 'Response body:'
      Write-Host $body
    } catch {
      Write-Host 'Could not read response body:' $_.Exception.Message
    }
  } else {
    Write-Host $_.Exception.Message
  }
  exit 1
}
