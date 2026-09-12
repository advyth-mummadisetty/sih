Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path (Join-Path $PSScriptRoot "..\assets\krishisetu-logo.jpg")).Path
$destPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..\assets")).Path "krishisetu-logo.png")

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($src, 0, 0, $w, $h)
$g.Dispose()
$src.Dispose()

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = [Math]::Abs($bmpData.Stride) * $h
$rgbValues = New-Object byte[] $bytes

[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $rgbValues, 0, $bytes)

# Target background is creamy off-white: around R=244, G=243, B=238
for ($i = 0; $i -lt $bytes; $i += 4) {
    $b = [int]$rgbValues[$i]
    $gVal = [int]$rgbValues[$i + 1]
    $r = [int]$rgbValues[$i + 2]
    
    # Calculate distance to light background / white threshold
    # The logo content has rich blue (#1b3a57 / #0d2840), golden wheat (#cda851), green, dark text
    # Light background is R > 220, G > 220, B > 210
    if ($r -gt 225 -and $gVal -gt 220 -and $b -gt 210) {
        $rgbValues[$i + 3] = 0 # Fully transparent
    } elseif ($r -gt 205 -and $gVal -gt 200 -and $b -gt 190) {
        # Soft feathering on edges
        $avg = ($r + $gVal + $b) / 3.0
        $factor = [Math]::Max(0.0, [Math]::Min(1.0, (230.0 - $avg) / 25.0))
        $rgbValues[$i + 3] = [byte]($factor * 255)
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $bmpData.Scan0, $bytes)
$bmp.UnlockBits($bmpData)

$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Generated transparent PNG: $destPath"
