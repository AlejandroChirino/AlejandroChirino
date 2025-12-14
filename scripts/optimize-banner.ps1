# Optimize banner image (PowerShell)
# Requisitos: ImageMagick (`magick`), opcional `cwebp` (libwebp) o `avifenc` si quieres AVIF.
# Uso: desde la raíz del repo en PowerShell:
#   ./scripts/optimize-banner.ps1 -Quality 80 -Width 1600

param(
  [int] $Quality = 80,
  [int] $Width = 1600,
  [string] $Src = "public/IMG_9061.JPG",
  [string] $OutBase = "public/img_9061"
)

function Check-Command($cmd) {
  $p = Get-Command $cmd -ErrorAction SilentlyContinue
  return $null -ne $p
}

Write-Host "Optimizing banner image..." -ForegroundColor Cyan
Write-Host "Source: $Src" -ForegroundColor DarkCyan
Write-Host "Quality: $Quality | Max width: $Width" -ForegroundColor DarkCyan

if (-not (Test-Path $Src)) {
  Write-Error "Source file not found: $Src"
  exit 1
}

if (-not (Check-Command magick)) {
  Write-Error "ImageMagick 'magick' not found in PATH. Install ImageMagick and try again."
  exit 1
}

$jpgOut = "${OutBase}-${Width}.jpg"
$webpOut = "${OutBase}-${Width}.webp"

# Convert to sRGB, strip metadata, resize to width if larger, and set quality
Write-Host "Generating JPEG: $jpgOut" -ForegroundColor Green
magick convert $Src -strip -colorspace sRGB -resize ${Width}x\> -quality $Quality $jpgOut

# Generate WebP if cwebp available
if (Check-Command cwebp) {
  Write-Host "Generating WebP: $webpOut" -ForegroundColor Green
  & cwebp -q $Quality $jpgOut -o $webpOut
} else {
  Write-Host "cwebp not found — skipping WebP generation" -ForegroundColor Yellow
}

Write-Host "Optimization complete." -ForegroundColor Cyan

# Optional: show resulting file sizes
Get-Item $jpgOut | Select Name, @{Name='SizeKB';Expression={[math]::Round($_.Length/1KB,2)}} | Format-Table
if (Test-Path $webpOut) { Get-Item $webpOut | Select Name, @{Name='SizeKB';Expression={[math]::Round($_.Length/1KB,2)}} | Format-Table }

Write-Host "If output looks good, you can rename and commit the optimized files:" -ForegroundColor White
Write-Host "  git mv public/IMG_9061.JPG public/IMG_9061.backup.JPG" -ForegroundColor Gray
Write-Host "  git mv $jpgOut public/img_9061.jpg" -ForegroundColor Gray
Write-Host "  git add public/img_9061.jpg" -ForegroundColor Gray
Write-Host "  git commit -m 'Optimize banner image: recompress to quality $Quality and lowercase name'" -ForegroundColor Gray
Write-Host "  git push origin HEAD" -ForegroundColor Gray

Write-Host "Done." -ForegroundColor Cyan
