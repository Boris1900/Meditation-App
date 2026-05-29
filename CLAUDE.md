# Augenblick – Projektdokumentation

## Übersicht
Sanfter Meditations-Timer mit Klangschale, ursprünglich für Boris + Katharina, jetzt als
"Augenblick"-App auch an Freunde und Interessierte weitergebbar. PWA + Android APK via Capacitor.
GitHub Pages: https://boris1900.github.io/Meditation-App/ | Repo: Boris1900/Meditation-App

**Hinweis:** Android-Paketname bleibt `de.tinnituspraxis.meditation` (Legacy, nicht sichtbar im
Normalbetrieb). Wird erst beim großen Tinnitus-Meditations-Produkt sauber neu aufgesetzt.

## Dateistruktur
```
MeditationsApp/
├── index.html, style.css, app.js, sw.js, manifest.json  # Hauptdateien
├── background.jpg               # Hintergrundbild (Buddha, Bambus, Kerze)
├── background_laecheln_v0.4.jpg # Buddha-Lächeln-Bild
├── gong.png                     # Gong mit Halterung (Buddha-Modus)
├── gong_ohne_halter.png         # Gong ohne Halterung (Farbmodus, Welleneffekt)
├── icon-1024.png                # App-Icon-Quelle 1024x1024
├── Sounds/                      # Klangschalen-MP3s
├── build-android.ps1            # Build-Skript für Android APK
├── test_flamme.html             # Testseite: Flammen-Position
├── test_aura_v136.html          # Testseite: Buddha-Aura-Position
├── test_gong_welle.html         # Testseite: Gong-Welleneffekt (Prototyp)
├── xold/                        # Archivierte alte Dateiversionen
├── www/                         # Build-Artefakt Android (nicht bearbeiten)
├── android/                     # Capacitor Android-Projekt (nicht bearbeiten)
└── CLAUDE.md                    # Diese Datei
```

## Aktueller Stand – v1.59
- Timer 1–90 Min, Wake Lock ab App-Start, Abdunkelung 0–95%
- **Lebendige Flamme** (Checkbox): Flackern + Schein Stärke 30 in einem Schalter; ausgegraut wenn Farbhintergrund aktiv
- Buddha-Lächeln + Aura: immer aktiv bei Buddha-Hintergrund, bei Start/Stop + alle 30–45 Sek.
- Gong-Animation, 3 Klangschalen (localStorage), Update-Funktion (APK-Download)
- **Zwischen-Gong** (Checkbox + Slider): Countdown rechts neben Haupttimer, Gong feuert zur eingestellten Zeit; schwingt sichtbar durch Abdunklung (z-index 55), blendet danach 2,5 Sek. weich aus
- **Hintergrundfarbe** (8 Felder): Buddha-Bild, Schwarz, Sehr dunkel, Dunkelgrau, Dunkelblau, Dunkelgrün, Grasgrün, Warmes Gelb – per localStorage, Flamme auto-aus bei Farbwahl
- **Gong-Welleneffekt** (Farbmodus): Bei einfarbigem Hintergrund zeigt `gong_ohne_halter.png` einen weichen Schallwellen-Ring statt Swing – bei Klick, Timer-Ende und Zwischen-Gong
- PWA (iOS Safari + Android Chrome), Service Worker, Offline-Nutzung

### Wichtige Konstanten (app.js)
```
FLAME_X_PCT = 0.8449,  FLAME_Y_PCT = 0.7378
AURA_X_PCT  = 0.28,    AURA_Y_PCT  = 0.59   ← zuletzt OK, so lassen
AURA_SIZE_PCT = 0.46
IMG_W_GONG = 1024,     IMG_H_GONG = 1536
DISC_Y_PCT = 0.537,    DISC_R_PCT = 0.292   ← Scheibenmitte/-radius für Welleneffekt
```

### Technische Notiz
Weiße Linie Android (Power-Button → Chrome-Reload) → Webtech-Grenze, in der APK kein Problem.

## Build-Workflow Android
⚠️ Reihenfolge einhalten – sonst landet alte Version in der APK!

1. Änderungen in Hauptdateien vornehmen
2. Version hochzählen: `app.js` (APP_VERSION) + `sw.js` (CACHE_NAME) → aktuell `v1.59`
3. `.\build-android.ps1` ausführen
4. APK per Gradle bauen:
   `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"`
   `$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"`
   `cd android; .\gradlew assembleDebug`
5. APK umbenennen + GitHub Release erstellen:
   `Copy-Item android\app\build\outputs\apk\debug\app-debug.apk MeditationApp-vX.XX.apk`
   `gh release create vX.XX MeditationApp-vX.XX.apk --title "..." --notes "..."`

APK: `android\app\build\outputs\apk\debug\app-debug.apk`
iOS: `git push` → GitHub Pages → Katharina tippt „Auf Update prüfen"

**iOS-PWA bei Namensänderung:** iOS liest das Manifest nach dem ersten "Zum Home-Bildschirm"
nicht neu ein. Der Homescreen-Name bleibt also der alte (z.B. "Meditation") auch nach Updates.
Damit der neue Name (z.B. "Augenblick") außen erscheint, muss die PWA einmal vom Homescreen
gelöscht und über Safari neu hinzugefügt werden. Daten bleiben erhalten (hängen an der URL).

**Neue Datei hinzugefügt?** → Auch in `build-android.ps1` + `sw.js` eintragen!

**Ab v1.60:** Nur noch `Augenblick-vX.XX.apk` nötig – alle Altinstallationen (v1.57) haben jetzt v1.59 und kennen den neuen Namen.

## Offene Punkte

**Feature A: Hintergrundfarbe** ✅ fertig in v1.54
**Feature B: Zwischengong** ✅ fertig in v1.53
**Feature C: Gong-Swing beim Zwischen-Gong** ✅ fertig in v1.55
**Feature D: Gong-Welleneffekt bei Farbhintergrund** ✅ fertig in v1.57
**Fix: iOS-Timer-Zittern** ✅ fertig in v1.58 – Haupttimer + Zwischen-Gong-Timer zittern nicht mehr
**Fix: iOS-Digit-Trennlinien** ✅ fertig in v1.59 – overflow:hidden entfernt, Rendering-Artefakte weg

### Mittelfristig
- Play Store (25€), weitere Klangschalen

### Aufgeschoben
- Multi-MP3, Service Worker iOS optimieren

## Arbeitsregel
**Immer erst fragen, bevor eine Idee umgesetzt wird.**

## Lokaler Server
`npx serve -p 3456 .`

## Kontext für neue Session
- Boris: Heilpraktiker, kein Entwickler, beurteilt visuell
- Testgeräte: OnePlus 5 (Android 10) + iPhone Katharina (iOS/Safari)
- Android Studio Panda 4, debug APK, StatusBar transparent via `@capacitor/status-bar`
