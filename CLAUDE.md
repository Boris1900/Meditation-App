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

## Aktueller Stand (Session 16 – v1.48)

### Alles was funktioniert
- Layout, Timer 1–90 Min, Wake Lock (ab Seitenstart, nicht erst beim Timer)
- Abdunkelung 0–95%, Flammen-Schein, Flackern, Buddha-Lächeln + Aura
- Gong-Animation: rotateX, sauber, weiches Ausschwingen
- Klangschalen-Menü: 3 Sounds, localStorage, Update-Check-Button
- PWA (iOS Safari + Android Chrome), GitHub Pages
- **Service Worker (v1.40):** Offline-Nutzung, Cache-First, automatische Updates
- **Wake Lock ab Start (v1.42):** Screen bleibt an sobald App offen ist
- **Android APK (v1.43):** Capacitor, StatusBar transparent, richtiges Icon, dunkler Splash
- **Update-Funktion (v1.47):** APK prüft GitHub Pages auf neue Version, bietet direkten APK-Download
- **Buddha-Lächeln bei Start + Ende (v1.46/v1.47):** `triggerBuddhaSmileOnce()` bei Start und Stop/Ablauf
- **Android Navigationsleiste (v1.45):** `env(safe-area-inset-bottom)` auf `#bottom-nav`
- GitHub Pages: https://boris1900.github.io/Meditation-App/

### Änderungen Session 16 (v1.44–v1.47)
- **v1.44:** Update-Button zeigt auf Android "APK laden" mit GitHub-Release-Link. APK-Namenskonvention ab jetzt: `MeditationApp-v1.XX.apk` (kein Suffix mehr!)
- **v1.45:** Android Navigationsleiste fix (`env(safe-area-inset-bottom)`), Dateiname `background_laecheln` (Umlaut entfernt)
- **v1.46:** Buddha-Lächeln + Halo bei Meditations-Start und -Ende (`triggerBuddhaSmileOnce`)
- **v1.47:** Update-Check holt `app.js` von GitHub Pages statt lokalem Bundle (war fundamental kaputt)
- **v1.48:** Update-Funktion erstmals erfolgreich getestet – Bekannte kann ab jetzt selbst updaten

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

### Nächste Session (v1.50)
- **"Lebendiger Buddha"-Checkbox entfernen** – Katharina (Frau von Boris) bemängelt, dass der Menüpunkt Verwirrung stiftet. Funktion soll immer aktiv sein, kein Schalter mehr.
  - Checkbox aus HTML entfernen
  - `buddhaCheckbox`-Referenzen aus JS entfernen
  - `triggerBuddhaSmile`, `triggerBuddhaSmileOnce`, `scheduleBuddhaSmile` laufen immer (keine Checkbox-Prüfung)
  - Lächeln + Aura immer: bei Start, bei Stop/Ende, alle 30–45 Sek. während Timer läuft
- **Buddha-Intervall:** Aktuell 30–45 Sek. – Boris findet das gut so, bleibt so
- **Aura-Position:** Halo leicht zu hoch. `AURA_Y_PCT = 0.59` → evtl. ~0.63. Testseite: `test_aura_v136.html`

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
