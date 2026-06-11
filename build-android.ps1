# Build-Skript: Web-Dateien nach www/ kopieren + Capacitor sync
# Aufruf: .\build-android.ps1

$src = $PSScriptRoot
$www = "$src\www"

# Aktuelle Version aus app.js lesen (z.B. v1.80)
$verMatch = (Get-Content "$src\app.js" | Select-String "APP_VERSION\s*=\s*'([^']+)'")
$version  = $verMatch.Matches.Groups[1].Value

# Alte APKs aufräumen: nur die der aktuellen Version behalten (GitHub hat alle Releases)
Get-ChildItem "$src\Augenblick-v*.apk" -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne "Augenblick-$version.apk" } |
  ForEach-Object {
    Write-Host "Lösche alte APK: $($_.Name)" -ForegroundColor DarkGray
    Remove-Item $_.FullName -Force
  }

Write-Host "Kopiere Web-Dateien nach www/..." -ForegroundColor Cyan

Copy-Item "$src\index.html"                    $www -Force
Copy-Item "$src\style.css"                     $www -Force
Copy-Item "$src\app.js"                        $www -Force
Copy-Item "$src\sw.js"                         $www -Force
Copy-Item "$src\manifest.json"                 $www -Force
Copy-Item "$src\background.jpg"                $www -Force
Copy-Item "$src\background_laecheln_v0.4.jpg"  $www -Force
Copy-Item "$src\berglandschaft_0.1.jpg"        $www -Force
Copy-Item "$src\meer_0.2.jpg"                 $www -Force
Copy-Item "$src\gong.png"                      $www -Force
Copy-Item "$src\gong_ohne_halter.png"          $www -Force
Copy-Item "$src\Sounds\*"                      "$www\Sounds\" -Force

Write-Host "Starte Capacitor Sync..." -ForegroundColor Cyan
npx cap sync android

Write-Host ""
Write-Host "Fertig! Aktuelle Version: $version" -ForegroundColor Green
Write-Host "Jetzt bauen und APK kopieren:" -ForegroundColor Green
Write-Host "  cd android; .\gradlew assembleDebug" -ForegroundColor Green
Write-Host "  Copy-Item android\app\build\outputs\apk\debug\app-debug.apk Augenblick-$version.apk -Force" -ForegroundColor Green
