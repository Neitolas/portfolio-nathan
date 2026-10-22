[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Imagem
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$portraitSourcePath = (Resolve-Path -LiteralPath $Imagem).ProviderPath
$portraitSource = [System.Drawing.Image]::FromFile($portraitSourcePath)
$portraitBitmap = $null
$portraitGraphics = $null

try {
    $portraitColumns = 110
    $portraitRows = [Math]::Max(1, [Math]::Round($portraitColumns * $portraitSource.Height / $portraitSource.Width * 0.55, [MidpointRounding]::AwayFromZero))
    $portraitBitmap = [System.Drawing.Bitmap]::new($portraitColumns, $portraitRows)
    $portraitGraphics = [System.Drawing.Graphics]::FromImage($portraitBitmap)
    $portraitGraphics.Clear([System.Drawing.Color]::Black)
    $portraitGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $portraitGraphics.DrawImage($portraitSource, 0, 0, $portraitColumns, $portraitRows)

    $portraitRamp = ' .:-=+*#%@'
    $portraitLines = [System.Collections.Generic.List[string]]::new()
    for ($portraitY = 0; $portraitY -lt $portraitRows; $portraitY++) {
        $portraitLine = [System.Text.StringBuilder]::new()
        for ($portraitX = 0; $portraitX -lt $portraitColumns; $portraitX++) {
            $portraitPixel = $portraitBitmap.GetPixel($portraitX, $portraitY)
            $portraitLuminance = (0.2126 * $portraitPixel.R + 0.7152 * $portraitPixel.G + 0.0722 * $portraitPixel.B) / 255
            # Doubles evitam que o PowerShell arredonde os tons ao selecionar overloads inteiros.
            $portraitTone = [Math]::Pow([Math]::Min(1.0, [Math]::Max(0.0, ($portraitLuminance - 0.06) / 0.88)), 0.9)
            $portraitIndex = [Math]::Min($portraitRamp.Length - 1, [Math]::Floor($portraitTone * $portraitRamp.Length))
            [void]$portraitLine.Append($portraitRamp[$portraitIndex])
        }
        $portraitLines.Add($portraitLine.ToString())
    }

    $portraitData = [ordered]@{
        columns = $portraitColumns
        rows = $portraitRows
        sourceSha256 = (Get-FileHash -LiteralPath $portraitSourcePath -Algorithm SHA256).Hash.ToLowerInvariant()
        text = $portraitLines -join "`n"
    }
    $portraitProjectRoot = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
    $portraitOutputPath = Join-Path $portraitProjectRoot 'src\portrait.js'
    $portraitOutput = 'export const portrait = ' + ($portraitData | ConvertTo-Json -Depth 3) + ";`n"
    [System.IO.File]::WriteAllText($portraitOutputPath, $portraitOutput, [System.Text.UTF8Encoding]::new($false))
    Write-Output ("Retrato gerado: {0} colunas, {1} linhas. Apenas caracteres e hash da origem foram salvos." -f $portraitColumns, $portraitRows)
} finally {
    if ($null -ne $portraitGraphics) { $portraitGraphics.Dispose() }
    if ($null -ne $portraitBitmap) { $portraitBitmap.Dispose() }
    $portraitSource.Dispose()
}
