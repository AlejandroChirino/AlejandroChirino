# PowerShell script para crear un pedido y verificar filas en Supabase (opcional)
# Uso:
#   ./scripts/test_order_with_coupon.ps1
# Variables de entorno:
#   $env:API_URL (por defecto http://localhost:3000)
#   $env:SUPABASE_URL (opcional)
#   $env:SUPABASE_SERVICE_ROLE_KEY (opcional)

$apiUrl = $env:API_URL
if (-not $apiUrl) { $apiUrl = 'http://localhost:3000' }

# EDITA el payload según tus productos
$payload = @{
    items = @(
        @{ product_id = 'REEMPLAZA_PRODUCTO_1'; price = 25000; quantity = 1 },
        @{ product_id = 'REEMPLAZA_PRODUCTO_2'; price = 25000; quantity = 1 }
    )
    shipping_address = @{ street = 'Calle Falsa 123'; city = 'Ciudad' }
    customer = @{ fullName = 'Juan'; email = 'juan@example.com' }
    user_id = $null
    appliedCoupon = @{ code = 'CODIGO10' }
}

$body = $payload | ConvertTo-Json -Depth 10

Write-Host "POST $apiUrl/api/orders"
try {
    $resp = Invoke-RestMethod -Uri "$apiUrl/api/orders" -Method Post -Body $body -ContentType 'application/json'
} catch {
    Write-Error "Error al crear orden: $_"
    exit 1
}

Write-Host "Respuesta:"; $resp | ConvertTo-Json -Depth 10

$orderId = $resp.id
if (-not $orderId) { Write-Error 'No se devolvió id de orden'; exit 1 }

if ($env:SUPABASE_URL -and $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host 'Verificando en Supabase via REST...'
    $supabaseUrl = $env:SUPABASE_URL.TrimEnd('/')
    $key = $env:SUPABASE_SERVICE_ROLE_KEY
    $headers = @{ "apikey" = $key; "Authorization" = "Bearer $key" }

    $orders = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/orders?select=*&id=eq.$orderId" -Headers $headers -Method Get
    $items = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/order_items?select=*&order_id=eq.$orderId" -Headers $headers -Method Get
    $uses = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/coupon_uses?select=*&order_id=eq.$orderId" -Headers $headers -Method Get

    Write-Host "`n--- Orders ---"
    $orders | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host "`n--- Order Items ---"
    $items | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host "`n--- Coupon Uses ---"
    $uses | ConvertTo-Json -Depth 10 | Write-Host
} else {
    Write-Host "\nNo se proporcionaron variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Para ver filas:
select * from orders where id = '$orderId';
select * from order_items where order_id = '$orderId';
select * from coupon_uses where order_id = '$orderId';"
}
