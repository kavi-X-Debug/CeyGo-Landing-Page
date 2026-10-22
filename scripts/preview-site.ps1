# Serves the built CeyGo site (client\dist) on http://localhost:5173
# using only Windows PowerShell - no Node.js or installs needed.
# Started by "Preview CeyGo.bat". Press Ctrl+C or close the window to stop.

param([int]$Port = 5173)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$root = [IO.Path]::GetFullPath((Join-Path $projectRoot 'client\dist'))

if (-not (Test-Path (Join-Path $root 'index.html'))) {
    Write-Host ''
    Write-Host '  The built site was not found in client\dist.' -ForegroundColor Red
    Write-Host '  Build it with:  npm run build   (needs Node.js)'
    Read-Host '  Press Enter to close'
    exit 1
}

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.webp' = 'image/webp'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.ico'  = 'image/x-icon'
    '.mp4'  = 'video/mp4'
    '.woff2' = 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
    $listener.Start()
} catch {
    Write-Host ''
    Write-Host "  Port $Port is already in use. Close the other program using it, or run:" -ForegroundColor Red
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\preview-site.ps1 -Port 5180"
    Read-Host '  Press Enter to close'
    exit 1
}

$url = "http://localhost:$Port/"
Write-Host ''
Write-Host '  CeyGo is running' -ForegroundColor Green
Write-Host "  Open $url in your browser"
Write-Host '  Close this window to stop the site.'
Write-Host ''
Start-Process $url

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
        $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')

        if ($rel -eq 'api/health') {
            $body = [Text.Encoding]::UTF8.GetBytes('{"status":"ok","service":"ceygo-preview"}')
            $res.ContentType = 'application/json; charset=utf-8'
            $res.ContentLength64 = $body.Length
            $res.OutputStream.Write($body, 0, $body.Length)
            continue
        }

        if ($rel -eq '') { $rel = 'index.html' }
        $file = [IO.Path]::GetFullPath((Join-Path $root ($rel -replace '/', '\')))

        # Stay inside client\dist; unknown routes (e.g. /owner/login) get index.html for React Router.
        if (-not $file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $file -PathType Leaf)) {
            if ([IO.Path]::GetExtension($rel)) {
                $res.StatusCode = 404
                continue
            }
            $file = Join-Path $root 'index.html'
        }

        $ext = [IO.Path]::GetExtension($file).ToLower()
        $type = $mime[$ext]
        if (-not $type) { $type = 'application/octet-stream' }
        $res.ContentType = $type
        if ($ext -ne '.html') { $res.Headers.Add('Cache-Control', 'public, max-age=3600') }

        $bytes = [IO.File]::ReadAllBytes($file)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
        try { $res.StatusCode = 500 } catch {}
    } finally {
        try { $res.OutputStream.Close() } catch {}
    }
}
