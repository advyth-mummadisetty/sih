Add-Type -AssemblyName System.Drawing

$pngPath = (Resolve-Path (Join-Path $PSScriptRoot "..\assets\krishisetu-logo.png")).Path
$bmp = [System.Drawing.Bitmap]::FromFile($pngPath)
$w = $bmp.Width
$h = $bmp.Height

$minX = $w; $minY = $h; $maxX = 0; $maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 15) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Add small padding
$padding = 10
$cropX = [Math]::Max(0, $minX - $padding)
$cropY = [Math]::Max(0, $minY - $padding)
$cropW = [Math]::Min($w - $cropX, ($maxX - $minX) + ($padding * 2))
$cropH = [Math]::Min($h - $cropY, ($maxY - $minY) + ($padding * 2))

Write-Host "Cropping bounds: X=$cropX, Y=$cropY, W=$cropW, H=$cropH"

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$croppedBmp = $bmp.Clone($cropRect, $bmp.PixelFormat)
$bmp.Dispose()

$croppedBmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Dispose()
Write-Host "Successfully trimmed and saved transparent logo to $pngPath"
