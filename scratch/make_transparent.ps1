Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\assets\krishisetu-logo.jpg"
$destPath = Join-Path $PSScriptRoot "..\assets\krishisetu-logo.png"

$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $srcPath).Path)
$w = $src.Width
$h = $src.Height
Write-Host "Dimensions: $w x $h"

# Create 32-bit ARGB bitmap
$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.DrawImage($src, 0, 0, $w, $h)
$graphics.Dispose()
$src.Dispose()

# Sample the top-left background color
$bgSample = $bmp.GetPixel(5, 5)
Write-Host "Background sample RGB: $($bgSample.R), $($bgSample.G), $($bgSample.B)"

# Remove background (pixels that are very close to the light background or near-white)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        
        # Check distance to background or if it's very light/off-white (e.g. R > 230, G > 230, B > 220)
        # Background is typically creamy white
        $isBg = ($c.R -gt 225 -and $c.G -gt 225 -and $c.B -gt 215)
        
        # Also check color distance to sample
        $dist = [Math]::Sqrt([Math]::Pow($c.R - $bgSample.R, 2) + [Math]::Pow($c.G - $bgSample.G, 2) + [Math]::Pow($c.B - $bgSample.B, 2))
        
        if ($isBg -or $dist -lt 35) {
            # Make transparent
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        } elseif ($dist -lt 55) {
            # Smooth edge / antialias alpha
            $alpha = [int]([Math]::Min(255, [Math]::Max(0, (($dist - 35) / 20) * 255)))
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        }
    }
}

$bmp.Save((Resolve-Path $destPath).Path, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Successfully generated transparent PNG: $destPath"
