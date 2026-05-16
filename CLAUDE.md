# Meditations-App – Projektdokumentation

## Übersicht
Persönliche Meditations-Timer-App für Boris Seedorf. Vorbild: "Meditation Time" App.
Technologie: Reines HTML/CSS/JavaScript (PWA + Android APK via Capacitor).

## Dateistruktur
```
MeditationsApp/
├── index.html              # Haupt-HTML
├── style.css               # Alle Styles
├── app.js                  # Gesamte App-Logik
├── sw.js                   # Service Worker (Offline + Cache)
├── manifest.json           # PWA-Manifest
├── background.jpg          # Hintergrundbild (Buddha, Bambus, Kerze)
├── background_lächeln_v0.3.jpg  # Buddha-Lächeln-Bild
├── gong.png                # Gong-Bild (freigestellt, RGBA PNG)
├── Sounds/                 # Klangschalen-MP3s
├── www/                    # Kopie der Web-Dateien für Android APK (nicht manuell bearbeiten)
├── android/                # Capacitor Android-Projekt (nicht manuell bearbeiten)
├── assets/icon-only.png   # Quelle App-Icons 1024x1024
├── build-android.ps1       # Build-Skript für Android APK
├── test_aura_v136.html     # Testseite: Buddha-Aura
├── test_flamme.html        # Testseite: Flammen-Position
└── CLAUDE.md               # Diese Datei
```

## Aktueller Stand (Session 15 – v1.43)

### Alles was funktioniert
- Layout, Timer 1–90 Min, Wake Lock (ab Seitenstart, nicht erst beim Timer)
- Abdunkelung 0–95%, Flammen-Schein, Flackern, Buddha-Lächeln + Aura
- Gong-Animation: rotateX, sauber, weiches Ausschwingen
- Klangschalen-Menü: 3 Sounds, localStorage, Update-Check-Button
- PWA (iOS Safari + Android Chrome), GitHub Pages
- **Service Worker (v1.40):** Offline-Nutzung, Cache-First, automatische Updates
- **Wake Lock ab Start (v1.42):** Screen bleibt an sobald App offen ist
- **Android APK (v1.43):** Capacitor, StatusBar transparent, richtiges Icon, dunkler Splash
- GitHub Pages: https://boris1900.github.io/Meditation-App/

### Änderungen Session 15 (v1.39.1–v1.43)
- **v1.39.1:** Inline `background:#000` im Head (hat weiße Linie nicht behoben)
- **v1.40:** Service Worker → Offline-Support, Cache-First-Strategie
- **v1.41:** `overscroll-behavior: none` gegen Pull-to-Refresh
- **v1.42:** Wake Lock sofort beim Laden + bei Screen-on (nicht nur beim Timer)
- **v1.43:** Android APK via Capacitor – StatusBar transparent, Icon, dunkler Splash
- **v1.44:** Update-Button zeigt auf Android "APK laden" mit GitHub-Release-Link. APK-Namenskonvention ab jetzt: `MeditationApp-v1.XX.apk` (kein Suffix mehr!)

### Weiße Linie Android – Fazit Session 15
- **Power-Button** überschreibt Wake Lock → Chrome lädt neu → weiße Linie bleibt
- Webtech-Grenze erreicht. Lösung nur via nativem Wrapper (Capacitor APK löst es vollständig)
- In der APK: Problem nicht vorhanden, da kein Chrome-Reload

### Flammen-Architektur
```
#flame-flicker → Ankerpunkt, position: fixed bei --flame-x/y
::before       → sichtbare Flamme, transform-origin: bottom center
FLAME_X_PCT = 0.8449, FLAME_Y_PCT = 0.7378
```
Für Positionierung: `test_flamme.html` nutzen.

### Aura-Architektur
```
AURA_SIZE_PCT = 0.46, AURA_X_PCT = 0.28, AURA_Y_PCT = 0.59
bgViewH() → iOS: screen.height / Android: innerHeight
```
Für Positionierung: `test_aura_v136.html` nutzen.

---

## Android APK – Capacitor-Setup

### Installierte Pakete
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- `@capacitor/status-bar` – StatusBar transparent
- `@capacitor/assets` – Icon-Generierung

### Build-Workflow
⚠️ **Reihenfolge zwingend einhalten – sonst landet alte Version in der APK!**

1. Code-Änderungen in den Hauptdateien vornehmen (`app.js`, `style.css`, etc.)
2. Versionsnummer hochzählen in `app.js` (APP_VERSION) und `sw.js` (CACHE_NAME)
3. Erst dann das Build-Skript ausführen:
```powershell
.\build-android.ps1          # Web-Dateien → www/ + npx cap sync android
```
4. Android Studio: **Shift+Shift → "Generate APKs"** → APK umbenennen → verteilen.

**Niemals** `build-android.ps1` ausführen bevor alle Änderungen gemacht sind – das Skript kopiert den aktuellen Stand, nicht den späteren.

**APK liegt in:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Neue Datei hinzugefügt?
→ Auch in `build-android.ps1` in die Copy-Liste eintragen!

### APK-Verteilung
- Nutzer brauchen "Installation aus unbekannten Quellen" einmalig aktivieren
- Kein Play Store nötig – direkte APK-Weitergabe per Link/WhatsApp
- **Geplant:** GitHub Releases als APK-Host + Update-Button lädt neue APK direkt herunter

---

## Versions-Workflow
Bei jeder Änderung **beide** hochzählen:
1. `app.js` Zeile 2: `const APP_VERSION = 'v1.43'`
2. `sw.js` Zeile 1: `const CACHE_NAME = 'meditation-v1.43'`

## iOS + Android synchron halten
**Dateien immer im Hauptordner bearbeiten** (nie direkt in `www/`).
- iOS: `git push` → GitHub Pages → automatisches Update
- Android: `.\build-android.ps1` → APK bauen → verteilen

---

## Offene Punkte

### Nächste Session
- **Buddha-Lächeln beim START** – `triggerBuddhaSmileOnce()` wird in `startTimer()` aufgerufen, aber die Opacity ändert sich nicht sichtbar. Beim STOP funktioniert es korrekt. Ursache noch unklar – in nächster Session debuggen.
- **Buddha-Intervall:** Von 30–45 Sek. auf 60–90 Sek. zurücksetzen (nach Tests)

### Bereits erledigt (Session 16)
- Android Navigationsleiste fix: `env(safe-area-inset-bottom)` auf `#bottom-nav`
- Datei `background_lächeln_v0.3.jpg` → `background_laecheln_v0.3.jpg` (Umlaut entfernt)
- Buddha-Lächeln + Halo bei Meditations-ENDE (Stop + Timer abgelaufen)

### Mittelfristig
- Play Store (25€ einmalig) für breitere Patienten-Verteilung
- Weitere Klangschalen (Muster: eine Zeile HTML + MP3, kein JS nötig)

### Aufgeschoben
- Multi-MP3-Feature, Service Worker für iOS optimieren

---

## Wichtige Arbeitsregel
**Immer erst fragen, bevor eine Idee umgesetzt wird.**

## Lokaler Entwicklungsserver
```
npx serve -p 3456 .
```

## Kontext für neue Session
- Boris: Heilpraktiker, kein Entwickler, beurteilt visuell
- Testet auf OnePlus 5 (Android 10, Chrome) und iPhone (Katharina, iOS/Safari)
- Android APK: Capacitor, Android Studio Panda 4, debug APK
- StatusBar: transparent via `@capacitor/status-bar` (`setOverlaysWebView`)
- Backup v1.39: Commit `e784187`
